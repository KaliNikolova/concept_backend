---
timestamp: 'Fri Nov 07 2025 14:28:54 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_142854.b55f0ba4.md]]'
content_id: 1ed53472e5c1282adc3db42ffea69d09d8b9f9f719a27b2596227d5c3b62c069
---

# file: src/concepts/Tasks/TasksConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Generic parameters for the Tasks concept
type User = ID;
type Task = ID;

/**
 * State: A set of Tasks with an owner, text, completion status, and order.
 */
interface TaskDoc {
  _id: Task;
  owner: User;
  text: string;
  isComplete: boolean;
  order: number;
  createdAt: Date;
}

const PREFIX = "Tasks.";

/**
 * concept: Tasks
 * purpose: to create and manage a user's to-do list items
 */
export default class TasksConcept {
  private readonly tasks: Collection<TaskDoc>;

  constructor(db: Db) {
    this.tasks = db.collection<TaskDoc>(PREFIX + "tasks");
  }

  /**
   * Initializes the task collection for a user. Can be used for setting up default tasks.
   */
  async createUserTasks({ user }: { user: User }): Promise<Empty> {
    // This is a placeholder. You could add logic here to create
    // default "welcome" tasks for a new user.
    console.log(`Initializing tasks for user ${user}`);
    return {};
  }

  /**
   * Creates a new task for a user.
   * effect: creates a new task with the given text and appends it to the user's list.
   */
  async createTask(
    { user, text }: { user: User; text: string },
  ): Promise<{ task: Task } | { error: string }> {
    const count = await this.tasks.countDocuments({ owner: user });
    const newTask: TaskDoc = {
      _id: freshID(),
      owner: user,
      text,
      isComplete: false,
      order: count, // Append to the end of the list
      createdAt: new Date(),
    };
    await this.tasks.insertOne(newTask);
    return { task: newTask._id };
  }

  /**
   * Updates the text of an existing task.
   * effect: changes the text of the specified task.
   */
  async updateTask(
    { task, newText }: { task: Task; newText: string },
  ): Promise<Empty | { error: string }> {
    const result = await this.tasks.updateOne({ _id: task }, {
      $set: { text: newText },
    });
    if (result.matchedCount === 0) {
      return { error: "Task not found." };
    }
    return {};
  }

  /**
   * Updates the order of multiple tasks for a user.
   * effect: sets the 'order' field for a list of tasks based on their position in the input array.
   */
  async reorderTasks(
    { user, orderedTasks }: { user: User; orderedTasks: Task[] },
  ): Promise<Empty> {
    const bulkOps = orderedTasks.map((taskId, index) => ({
      updateOne: {
        filter: { _id: taskId, owner: user },
        update: { $set: { order: index } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.tasks.bulkWrite(bulkOps);
    }
    return {};
  }

  /**
   * Marks a task as complete or incomplete.
   * effect: sets the 'isComplete' status of the specified task.
   */
  async markTaskComplete(
    { task, isComplete }: { task: Task; isComplete: boolean },
  ): Promise<Empty | { error: string }> {
    const result = await this.tasks.updateOne({ _id: task }, {
      $set: { isComplete },
    });
    if (result.matchedCount === 0) {
      return { error: "Task not found." };
    }
    return {};
  }

  /**
   * Deletes a single task.
   * effect: removes the specified task from the database.
   */
  async deleteTask({ task }: { task: Task }): Promise<Empty | { error: string }> {
    const result = await this.tasks.deleteOne({ _id: task });
    if (result.deletedCount === 0) {
      return { error: "Task not found." };
    }
    return {};
  }

  /**
   * Deletes all tasks associated with a user.
   * effect: removes all tasks for the given user.
   */
  async deleteAllForUser({ user }: { user: User }): Promise<Empty> {
    await this.tasks.deleteMany({ owner: user });
    return {};
  }

  // --- CORRECTED QUERIES ---

  /**
   * @query _getTasks
   * Retrieves all tasks for a given user, sorted by their order.
   * @returns A list of the user's tasks, correctly formatted for the sync engine.
   */
  async _getTasks({ user }: { user: User }): Promise<{ tasks: TaskDoc[] }[]> {
    const userTasks = await this.tasks
      .find({ owner: user })
      .sort({ order: 1 })
      .toArray();
    // Correct format: Return the result list wrapped in an object, which itself is in an array.
    return [{ tasks: userTasks }];
  }

  /**
   * @query _getRemainingTasks
   * Retrieves all incomplete tasks for a given user, sorted by their order.
   * @returns A list of the user's remaining (incomplete) tasks, correctly formatted.
   */
  async _getRemainingTasks(
    { user }: { user: User },
  ): Promise<{ tasks: TaskDoc[] }[]> {
    const remainingTasks = await this.tasks
      .find({ owner: user, isComplete: false })
      .sort({ order: 1 })
      .toArray();
    // Correct format: Return the result list wrapped in an object, which itself is in an array.
    return [{ tasks: remainingTasks }];
  }
}
```
