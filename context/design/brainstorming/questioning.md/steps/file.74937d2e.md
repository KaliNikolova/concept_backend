---
timestamp: 'Fri Nov 07 2025 13:07:56 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_130756.6beab854.md]]'
content_id: 74937d2e2ad5841dd97fa617a8c833bcab12c8ff0dc29ef9218e5186280eaeed
---

# file: src/concepts/Schedule/ScheduleConcept.ts

```typescript
import { Collection, Db } from "npm-mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Schedule" + ".";

type User = ID;
type Task = ID;
type Slot = ID;

/**
 * @concept Schedule
 * @purpose To manage a user's calendar by blocking out time for tasks or events.
 * @principle A user can block, update, and delete time slots on their calendar.
 */

/**
 * @state a set of Slots with
 *  an owner User
 *  a startTime Date
 *  an endTime Date
 *  a title String
 *  a taskId (optional) Task
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
      startTime,
      endTime,
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
    if (startTime) updateDoc.startTime = startTime;
    if (endTime) updateDoc.endTime = endTime;
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

  async deleteSlot({ user, slot }: { user: User; slot: Slot }): Promise<Empty | { error: string }> {
    const result = await this.slots.deleteOne({ _id: slot, owner: user });
    if (result.deletedCount === 0) {
      return { error: "Slot not found or permission denied." };
    }
    return {};
  }
  
  // Placeholder for a more complex calendar sync logic
  async syncCalendar({ user }: { user: User }): Promise<Empty> {
    console.log(`Syncing calendar for user ${user}...`);
    return {};
  }

  async deleteAllForUser({ user }: { user: User }): Promise<Empty> {
    await this.slots.deleteMany({ owner: user });
    return {};
  }

  /**
   * @query _getSlots (owner: User, start: Date, end: Date): (slots: SlotDocument[])
   * @returns All slots for a user within a given time range.
   */
  async _getSlots(
    { owner, start, end }: { owner: User; start: Date; end: Date },
  ): Promise<{ slots: SlotDocument[] }[]> { // CORRECTED RETURN TYPE
    const userSlots = await this.slots.find({
      owner,
      startTime: { $gte: start },
      endTime: { $lte: end },
    }).toArray();

    // CORRECT: Return result wrapped in an array, with the key 'slots'.
    return [{ slots: userSlots }];
  }
}
```

Once you've ensured all your queries follow this "return-an-array" contract, the `No overload matches this call` error will be completely resolved, and your synchronizations will be much more robust and predictable. You're building a very solid foundation by getting this right
