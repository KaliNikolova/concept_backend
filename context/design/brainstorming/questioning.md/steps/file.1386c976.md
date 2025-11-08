---
timestamp: 'Fri Nov 07 2025 11:11:56 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_111156.4992c5c1.md]]'
content_id: 1386c976a9b4de9ccbad6f2f9d55115959ede1dec603136a0ceabd8f28c25536
---

# file: src/concepts/Schedule/ScheduleConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Schedule" + ".";

type User = ID;
type Slot = ID;
type Task = ID;

/**
 * @concept Schedule
 * @purpose To manage discrete blocks of time in a user's calendar.
 * @principle A user can block out time for specific tasks or general activities, which can then be used by other concepts for planning.
 */

/**
 * @state a set of Slots with
 *  an owner User
 *  a startTime Date
 *  an endTime Date
 *  a title String
 *  an optional taskId Task
 */
interface SlotDocument {
  _id: Slot;
  owner: User;
  startTime: Date;
  endTime: Date;
  title: string;
  taskId?: Task;
}

export default class ScheduleConcept {
  private slots: Collection<SlotDocument>;

  constructor(db: Db) {
    this.slots = db.collection(PREFIX + "slots");
  }

  async blockTime(
    { owner, startTime, endTime, title, taskId }: {
      owner: User;
      startTime: Date;
      endTime: Date;
      title: string;
      taskId?: Task;
    },
  ): Promise<{ slot: Slot } | { error: string }> {
    const newSlot: SlotDocument = {
      _id: freshID(),
      owner,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      title,
      taskId,
    };
    await this.slots.insertOne(newSlot);
    return { slot: newSlot._id };
  }

  async updateSlot(
    { user, slot, startTime, endTime, title }: {
      user: User;
      slot: Slot;
      startTime?: Date;
      endTime?: Date;
      title?: string;
    },
  ): Promise<{ slot: Slot } | { error: string }> {
    const updateDoc: Partial<SlotDocument> = {};
    if (startTime) updateDoc.startTime = new Date(startTime);
    if (endTime) updateDoc.endTime = new Date(endTime);
    if (title) updateDoc.title = title;

    const result = await this.slots.updateOne(
      { _id: slot, owner: user },
      { $set: updateDoc },
    );
    if (result.matchedCount === 0) {
      return { error: "Slot not found or permission denied." };
    }
    return { slot };
  }

  async deleteSlot(
    { user, slot }: { user: User; slot: Slot },
  ): Promise<Empty | { error: string }> {
    const result = await this.slots.deleteOne({ _id: slot, owner: user });
    if (result.deletedCount === 0) {
      return { error: "Slot not found or permission denied." };
    }
    return {};
  }

  async syncCalendar({ user }: { user: User }): Promise<Empty> {
    // Placeholder for a more complex integration (e.g., Google Calendar)
    console.log(`Syncing calendar for user ${user}`);
    return {};
  }

  async deleteAllForUser({ user }: { user: User }): Promise<Empty> {
    await this.slots.deleteMany({ owner: user });
    return {};
  }

  /**
   * @query _getSlots (owner: User, start: Date, end: Date): (slots: SlotDocument[])
   * @returns All scheduled slots for a user within a given time range.
   */
  async _getSlots(
    { owner, start, end }: { owner: User; start: Date; end: Date },
  ): Promise<{ slots: SlotDocument[] }[]> {
    const userSlots = await this.slots.find({
      owner,
      startTime: { $gte: new Date(start) },
      endTime: { $lte: new Date(end) },
    }).sort({ startTime: 1 }).toArray();
    
    // CORRECT: Return the result wrapped in an array with the key 'slots'.
    return [{ slots: userSlots }];
  }
}
```

### 2. The `Planner` Concept

Now, here is the `PlannerConcept.ts` implementation. Notice `_getScheduledTasks` is corrected. The `planDay` and `replan` actions now expect to receive the necessary context (`tasksToSchedule` and `existingSchedule`) from the synchronization.
