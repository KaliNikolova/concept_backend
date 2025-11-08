---
timestamp: 'Fri Nov 07 2025 14:17:38 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_141738.2b41819a.md]]'
content_id: 8c0c9c0233813352076cfaae28064b64613453bbcc66167c22e46ce85726e1a9
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
   * @returns The user's current task, or null if they have no focused task.
   */
  async _getCurrentTask({ user }: { user: User }): Promise<{ task: Task } | null> {
    const focusDoc = await this.focus.findOne({ _id: user });
    if (!focusDoc) {
      return null;
    }
    return { task: focusDoc.task };
  }
}
```

This implementation of `_getCurrentTask` incorrectly returns either a single object or `null`. Here is the corrected version that properly returns an array.
