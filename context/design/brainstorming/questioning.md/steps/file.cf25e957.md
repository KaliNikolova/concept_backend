---
timestamp: 'Fri Nov 07 2025 13:26:25 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_132625.461868f8.md]]'
content_id: cf25e957b2dba5dabe2f464abf7826564f0fca850a27759ec303927ce5be73fb
---

# file: src/concepts/Planner/PlannerConcept.ts (Corrected)

```typescript
// NOTE: I've added some type definitions at the top for clarity,
// assuming what they might look like based on your code.

import { Collection, Db } from "npm-mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Planner" + ".";

type User = ID;
type Task = ID;
type DateTime = Date;

interface ScheduledTask {
  _id: ID;
  owner: User;
  task: Task;
  plannedStart: DateTime;
  plannedEnd: DateTime;
}

interface TaskWithDuration {
  id: Task;
  duration: number; // in minutes
}

interface BusySlot {
  start: DateTime;
  end: DateTime;
}


export default class PlannerConcept {
  private scheduledTasks: Collection<ScheduledTask>;

  constructor(db: Db) {
    this.scheduledTasks = db.collection(PREFIX + "scheduledTasks");
  }
  
  // ... (Your other public actions like planDay, replan, etc. would go here)

  /**
   * @query _getScheduledTasks
   * Retrieves all scheduled tasks for a given user.
   * @returns A list of scheduled tasks, sorted by start time.
   */
  async _getScheduledTasks(
    { user }: { user: User },
  ): Promise<{ tasks: ScheduledTask[] }[]> { // CORRECTED RETURN TYPE
    const tasks = await this.scheduledTasks
      .find({ owner: user }, {
        sort: { plannedStart: 1 },
      })
      .toArray();

    // CORRECT: Return the result wrapped in an array.
    // Even if there are no tasks, this will correctly return [{ tasks: [] }],
    // which the sync engine handles perfectly.
    return [{ tasks }];
  }
  
  /**
   * Core scheduling logic to fit tasks into available time slots.
   * This is a private helper, so its signature is correct as is.
   */
  private async _scheduleTasks(
    user: User,
    tasks: TaskWithDuration[],
    busySlots: BusySlot[],
    planFrom: DateTime,
    planUntil: DateTime,
  ): Promise<{ firstTask?: Task }> {
    const availableSlots = this._getAvailableSlots(
      planFrom,
      planUntil,
      busySlots,
    );
  
    const newScheduledTasks: ScheduledTask[] = [];
  
    for (const task of tasks) {
      const taskDurationMillis = task.duration * 60 * 1000;
  
      for (const slot of availableSlots) {
        const slotDurationMillis = slot.end.getTime() - slot.start.getTime();
  
        if (slotDurationMillis >= taskDurationMillis) {
          const plannedStart = slot.start;
          const plannedEnd = new Date(
            plannedStart.getTime() + taskDurationMillis,
          );
  
          newScheduledTasks.push({
            _id: freshID(),
            owner: user,
            task: task.id,
            plannedStart,
            plannedEnd,
          });
  
          slot.start = plannedEnd;
          break;
        }
      }
    }
  
    if (newScheduledTasks.length > 0) {
      await this.scheduledTasks.insertMany(newScheduledTasks);
    }
  
    return {
      firstTask: newScheduledTasks.length > 0
        ? newScheduledTasks[0].task
        : undefined,
    };
  }

  /**
   * Calculates available time slots within a given window, excluding busy periods.
   * This is a private helper, so its signature is correct as is.
   */
  private _getAvailableSlots(
    start: DateTime,
    end: DateTime,
    busySlots: BusySlot[],
  ): BusySlot[] {
    const availableSlots: BusySlot[] = [];
    let cursor = start;
  
    const sortedBusy = busySlots.sort((a, b) =>
      a.start.getTime() - b.start.getTime()
    );
  
    for (const busy of sortedBusy) {
      if (busy.start > cursor) {
        availableSlots.push({ start: cursor, end: busy.start });
      }
      cursor = new Date(Math.max(cursor.getTime(), busy.end.getTime()));
    }
  
    if (cursor < end) {
      availableSlots.push({ start: cursor, end: end });
    }
  
    return availableSlots;
  }
}
```
