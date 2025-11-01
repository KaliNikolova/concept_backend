---
timestamp: 'Fri Oct 31 2025 22:24:43 GMT-0400 (Eastern Daylight Time)'
parent: '[[..\20251031_222443.70a6d55b.md]]'
content_id: b5d1d0f635cebadaf047b69640f1061c67d517d05591c9035f60a588a781ce5d
---

# file: src\concepts\Schedule\ScheduleConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { freshID } from "../../utils/database.ts";
import { Empty, ID } from "../../utils/types.ts";

// Generic types used by this concept
type User = ID;
type BusySlotId = ID;

// Define a constant for the collection prefix
const PREFIX = "Schedule";

/**
 * Enum to represent the origin of a busy slot, ensuring type safety.
 */
enum SlotOrigin {
  MANUAL = "MANUAL",
  EXTERNAL = "EXTERNAL",
}

/**
 * Represents an event from an external calendar system.
 * This is used as the shape for input to the syncCalendar action.
 */
interface ExternalEvent {
  startTime: Date;
  endTime: Date;
  description: string;
}

/**
 * State: a set of BusySlots with an owner, start/end times, a description, and an origin.
 */
interface BusySlot {
  _id: BusySlotId;
  owner: User;
  startTime: Date;
  endTime: Date;
  description: string;
  origin: SlotOrigin;
}

/**
 * @purpose To represent a user's availability by combining non-negotiable, externally-scheduled commitments with manual time blocks.
 */
export default class ScheduleConcept {
  public readonly busySlots: Collection<BusySlot>;

  constructor(private readonly db: Db) {
    this.busySlots = this.db.collection<BusySlot>(`${PREFIX}.busySlots`);
  }

  /**
   * @effect Creates a new BusySlot for the user with the given details and sets origin to MANUAL.
   */
  async blockTime(
    { user, startTime, endTime, description }: {
      user: User;
      startTime: Date;
      endTime: Date;
      description: string;
    },
  ): Promise<{ slot: BusySlotId } | { error: string }> {
    if (startTime >= endTime) {
      return { error: "Start time must be before end time." };
    }

    const newSlotId = freshID() as BusySlotId;
    const newSlot: BusySlot = {
      _id: newSlotId,
      owner: user,
      startTime,
      endTime,
      description,
      origin: SlotOrigin.MANUAL,
    };

    const result = await this.busySlots.insertOne(newSlot);
    if (!result.acknowledged) {
      return { error: "Failed to create busy slot." };
    }
    return { slot: newSlotId };
  }

  /**
   * @requires slot.origin is MANUAL
   * @effect Modifies the properties of a manually created BusySlot.
   */
  async updateSlot(
    { slotId, newStartTime, newEndTime, newDescription }: {
      slotId: BusySlotId;
      newStartTime: Date;
      newEndTime: Date;
      newDescription: string;
    },
  ): Promise<Empty | { error: string }> {
    if (newStartTime >= newEndTime) {
      return { error: "Start time must be before end time." };
    }

    const existingSlot = await this.busySlots.findOne({ _id: slotId });

    if (!existingSlot) {
      return { error: "Slot not found." };
    }

    if (existingSlot.origin !== SlotOrigin.MANUAL) {
      return { error: "Cannot update a slot with an external origin." };
    }

    const result = await this.busySlots.updateOne({ _id: slotId }, {
      $set: {
        startTime: newStartTime,
        endTime: newEndTime,
        description: newDescription,
      },
    });

    if (result.matchedCount === 0) {
      return { error: "Slot not found or could not be updated." };
    }

    return {};
  }

  /**
   * @requires slot.origin is MANUAL
   * @effect Removes a manually created BusySlot.
   */
  async deleteSlot(
    { slotId }: { slotId: BusySlotId },
  ): Promise<Empty | { error: string }> {
    const existingSlot = await this.busySlots.findOne({ _id: slotId });

    if (!existingSlot) {
      return { error: "Slot not found." };
    }

    if (existingSlot.origin !== SlotOrigin.MANUAL) {
      return { error: "Cannot delete a slot with an external origin." };
    }

    const result = await this.busySlots.deleteOne({ _id: slotId });
    if (result.deletedCount === 0) {
      return { error: "Slot could not be deleted." };
    }

    return {};
  }

  /**
   * @effect Updates the user's schedule to match their external calendar without affecting MANUAL blocks.
   * This is achieved by removing all existing EXTERNAL slots and creating new ones from the provided events.
   */
  async syncCalendar(
    { user, externalEvents }: { user: User; externalEvents: ExternalEvent[] },
  ): Promise<Empty | { error: string }> {
    // This operation is performed as two separate steps for clarity. In a production system,
    // this should be wrapped in a database transaction to ensure atomicity.

    // 1. Delete all existing EXTERNAL slots for the user.
    await this.busySlots.deleteMany({
      owner: user,
      origin: SlotOrigin.EXTERNAL,
    });

    // 2. Create new slots from the externalEvents array if it's not empty.
    if (externalEvents && externalEvents.length > 0) {
      const newSlots: BusySlot[] = externalEvents
        .filter((event) => event.startTime < event.endTime) // Basic validation
        .map((event) => ({
          _id: freshID() as BusySlotId,
          owner: user,
          startTime: event.startTime,
          endTime: event.endTime,
          description: event.description,
          origin: SlotOrigin.EXTERNAL,
        }));

      if (newSlots.length > 0) {
        await this.busySlots.insertMany(newSlots);
      }
    }

    return {};
  }

  /**
   * @effect Removes all busy slots (both MANUAL and EXTERNAL) for the user.
   */
  async deleteAllForUser({ user }: { user: User }): Promise<Empty> {
    await this.busySlots.deleteMany({ owner: user });
    return {};
  }

  /**
   * @effect Returns all busy slots for the user, regardless of origin.
   */
  async _getSlots({ user }: { user: User }): Promise<BusySlot[]> {
    return await this.busySlots.find({ owner: user }).toArray();
  }
}

```

## Planner

Specification:

\`
concept Planner \[User, Task]
purpose having a realistic, time-based plan for a user's tasks
principle it intelligently fits a user's prioritized tasks into the open slots in their schedule

state
a set of ScheduledTasks with
an owner User
a task Task
a plannedStart DateTime
a plannedEnd DateTime

actions
planDay (user: User, tasks: seq of Task, busySlots: set of BusySlots): (firstTask: optional Task)
effect creates a new, full-day schedule by assigning tasks to available time slots; returns the first task, if any
replan (user: User, tasks: seq of Task, busySlots: set of BusySlots): (firstTask: optional Task)
effect discards remaining scheduled tasks and generates a new plan from the current time forward; returns the first task, if any
clearDay (user: User)
effect removes all ScheduledTasks for the given user for the current day
deleteAllForUser (user: User)
effect removes all scheduled tasks for the user
getNextTask (user: User, completedTask: Task): (nextTask: optional Task)
effect finds the task scheduled immediately after the completedTask and returns it
\`

Code:
