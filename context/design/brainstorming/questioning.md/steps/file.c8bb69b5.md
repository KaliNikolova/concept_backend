---
timestamp: 'Fri Nov 07 2025 10:02:01 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_100201.4bd305df.md]]'
content_id: c8bb69b5cc6df915cd7fc6aee017e21be9c45c0d773e0d235ece2dac0c88b311
---

# file: src/concepts/Focus/FocusConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";

// Generic type parameters for this concept
type User = ID;
type Task = ID;

// Prefix for MongoDB collections to namespace them for this concept
const PREFIX = "Focus.";

/**
 * Represents the state of the Focus concept.
 * Maps a User to their single current Task.
 *
 * state:
 *   a CurrentTask element of User with
 *     a task Task
 */
interface CurrentTaskDoc {
  _id: User;
  task: Task;
}

/**
 * Focus Concept
 *
 * @purpose To eliminate decision fatigue by presenting the single task a user should be working on right now.
 * @principle It presents the currently scheduled task to the user, providing a single point of focus.
 */
export default class FocusConcept {
  private readonly currentTasks: Collection<CurrentTaskDoc>;

  constructor(private readonly db: Db) {
    this.currentTasks = this.db.collection<CurrentTaskDoc>(PREFIX + "currentTasks");
  }

  /**
   * setCurrentTask (user: User, task: Task)
   *
   * **requires** true
   *
   * **effects** sets the specified task as the user's current focus
   */
  async setCurrentTask({ user, task }: { user: User; task: Task }): Promise<Empty> {
    await this.currentTasks.updateOne(
      { _id: user },
      { $set: { task: task } },
      { upsert: true },
    );
    return {};
  }

  /**
   * clearCurrentTask (user: User)
   *
   * **requires** true
   *
   * **effects** removes the current task for the user
   */
  async clearCurrentTask({ user }: { user: User }): Promise<Empty> {
    await this.currentTasks.deleteOne({ _id: user });
    return {};
  }

  /**
   * getCurrentTask (user: User): (task: optional Task)
   *
   * **requires** true
   *
   * **effects** returns the user's current task, if any
   */
  async getCurrentTask({ user }: { user: User }): Promise<{ task?: Task }> {
    const doc = await this.currentTasks.findOne({ _id: user });
    if (doc) {
      return { task: doc.task };
    }
    return {};
  }
}
```
