---
timestamp: 'Fri Nov 07 2025 10:53:41 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_105341.bab08b4f.md]]'
content_id: caa08284a6973255d90df73c2f91b41798e997276835fc276dd650a9333b555f
---

# file: src/concepts/Tasks/TasksConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Tasks" + ".";

type User = ID;
type Task = ID;

/**
 * @concept Tasks
 * @purpose Manage a user's list of tasks.
 * @principle A user can create, update, and organize their tasks to plan their work.
 */

/**
 * @state a set of Tasks with
 *  an owner User
 *  a title String
 *  a description String
 *  a duration Number (in minutes)
 *  a completed Boolean
 *  an order Number
 */
interface TaskDocument {
  _id: Task;
  owner: User;
  title: string;
  description: string;
  duration: number; // in minutes
  completed: boolean;
  order: number;
}

export default class TasksConcept {
  private tasks: Collection<TaskDocument>;

  constructor(db: Db) {
    this.tasks = db.collection(PREFIX + "tasks");
  }

  // NOTE: A sync would be needed to create this on UserAccount.register
  async createUserTasks({ user }: { user: User }): Promise<Empty> {
    // This action might be used to initialize things for a new user.
    // In this case, there's nothing to do, but it's a good pattern.
    return {};
  }

  async createTask(
    { owner, title, description, duration }: {
      owner: User;
      title: string;
      description: string;
      duration: number;
    },
  ): Promise<{ task: Task } | { error: string }> {
    const count = await this.tasks.countDocuments({ owner });

    const newTask: TaskDocument = {
      _id: freshID(),
      owner,
      title,
      description,
      duration,
      completed: false,
      order: count, // Append to the end of the list
    };

    await this.tasks.insertOne(newTask);
    return { task: newTask._id };
  }

  async updateTask(
    { user, task, title, description, duration }: {
      user: User;
      task: Task;
      title?: string;
      description?: string;
      duration?: number;
    },
  ): Promise<{ task: Task } | { error: string }> {
    const updateDoc: Partial<TaskDocument> = {};
    if (title !== undefined) updateDoc.title = title;
    if (description !== undefined) updateDoc.description = description;
    if (duration !== undefined) updateDoc.duration = duration;

    const result = await this.tasks.updateOne(
      { _id: task, owner: user }, // Ensure user owns the task
      { $set: updateDoc },
    );

    if (result.matchedCount === 0) {
      return { error: "Task not found or permission denied." };
    }
    return { task };
  }

  async reorderTasks(
    { user, orderedTasks }: { user: User; orderedTasks: Task[] },
  ): Promise<Empty | { error: string }> {
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

  async markTaskComplete(
    { user, task, completed }: { user: User; task: Task; completed: boolean },
  ): Promise<{ task: Task } | { error: string }> {
    const result = await this.tasks.updateOne(
      { _id: task, owner: user },
      { $set: { completed } },
    );

    if (result.matchedCount === 0) {
      return { error: "Task not found or permission denied." };
    }
    return { task };
  }

  async deleteTask(
    { user, task }: { user: User; task: Task },
  ): Promise<Empty | { error: string }> {
    const result = await this.tasks.deleteOne({ _id: task, owner: user });
    if (result.deletedCount === 0) {
      return { error: "Task not found or permission denied." };
    }
    return {};
  }

  // NOTE: Another concept would need to call this on UserAccount.deleteAccount
  async deleteAllForUser({ user }: { user: User }): Promise<Empty> {
    await this.tasks.deleteMany({ owner: user });
    return {};
  }

  /**
   * @query _getTasks (owner: User): (tasks: Task[])
   * @returns All tasks for a given user, sorted by their order.
   */
  async _getTasks(
    { owner }: { owner: User },
  ): Promise<{ tasks: TaskDocument[] }[]> {
    const userTasks = await this.tasks.find({ owner }).sort({ order: 1 })
      .toArray();
    // CORRECT: Return result wrapped in an array, with the key 'tasks'.
    return [{ tasks: userTasks }];
  }

  /**
   * @query _getRemainingTasks (owner: User): (tasks: Task[])
   * @returns All incomplete tasks for a given user, sorted by their order.
   */
  async _getRemainingTasks(
    { owner }: { owner: User },
  ): Promise<{ tasks: TaskDocument[] }[]> {
    const remainingTasks = await this.tasks.find({
      owner,
      completed: false,
    }).sort({ order: 1 }).toArray();
    // CORRECT: Return result wrapped in an array, with the key 'tasks'.
    return [{ tasks: remainingTasks }];
  }
}
```

Now that the `Tasks` concept correctly implements its queries, the synchronization file you already have will work without any changes. Here it is again for completeness.
