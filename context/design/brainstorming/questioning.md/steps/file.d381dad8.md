---
timestamp: 'Fri Nov 07 2025 14:17:38 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_141738.2b41819a.md]]'
content_id: d381dad8eadfe45746aa48895787a1e293ae3723cd45b52515a3fe230670ace3
---

# file: src/concepts/Focus/FocusConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";

// Generic parameters
type User = ID;
type Task = ID;

const PREFIX = "Focus.";

/**
 * State: A mapping from a User to their currently focused Task.
 */
interface FocusDoc {
  _id: User; // The user's ID
  task: Task; // The ID of the task they are focused on
}

/**
 * concept: Focus
 * purpose: to track the single task a user is actively working on
 */
export default class FocusConcept {
  private readonly focus: Collection<FocusDoc>;

  constructor(db: Db) {
    this.focus = db.collection<FocusDoc>(PREFIX + "focus");
  }

  /**
   * Sets the user's current task.
   * effect: if the user already has a focused task, it's replaced. Otherwise, a new one is set.
   */
  async setCurrentTask({ user, task }: { user: User; task: Task }): Promise<Empty> {
    await this.focus.updateOne(
      { _id: user },
      { $set: { task } },
      { upsert: true }, // Creates the document if it doesn't exist
    );
    return {};
  }

  /**
   * Clears the user's current task.
   * effect: removes the focused task entry for the user.
   */
  async clearCurrentTask({ user }: { user: User }): Promise<Empty> {
    await this.focus.deleteOne({ _id: user });
    return {};
  }

  /**
   * @query _getCurrentTask
   * Retrieves the user's currently focused task.
   * @returns An array containing the user's current task, or an empty array if none is set.
   */
  async _getCurrentTask({ user }: { user: User }): Promise<{ task: Task }[]> {
    const focusDoc = await this.focus.findOne({ _id: user });
    if (!focusDoc) {
      return [];
    }
    return [{ task: focusDoc.task }];
  }
}
```
