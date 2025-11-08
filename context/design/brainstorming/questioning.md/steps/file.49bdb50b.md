---
timestamp: 'Fri Nov 07 2025 13:35:59 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_133559.aa1f9081.md]]'
content_id: 49bdb50befbe170701efb0c972214c35f06c7b7e4da5a01d2430c7818109282a
---

# file: src/concepts/Planner/PlannerConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
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

function getEndOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export default class PlannerConcept {
  private scheduledTasks: Collection<ScheduledTask>;
  private timeProvider: () => Date;

  constructor(db: Db, timeProvider: () => Date = () => new Date()) {
    this.scheduledTasks = db.collection(PREFIX + "scheduledTasks");
    this.timeProvider = timeProvider;
  }

  async planDay(
    { user, tasks, busySlots }: {
      user: User;
      tasks: TaskWithDuration[];
      busySlots: BusySlot[];
    },
  ): Promise<{ firstTask?: Task } | { error: string }> {
    const now = this.timeProvider();
    // Clear any previously scheduled tasks that haven't started yet
    await this.scheduledTasks.deleteMany({
      owner: user,
      plannedStart: { $gte: now },
    });
    return this._scheduleTasks(user, tasks, busySlots, now, getEndOfDay(now));
  }

  async replan(
    { user, tasks, busySlots }: {
      user: User;
      tasks: TaskWithDuration[];
      busySlots: BusySlot[];
    },
  ): Promise<{ firstTask?: Task } | { error: string }> {
    // For this implementation, replan has the same logic as planDay
    return this.planDay({ user, tasks, busySlots });
  }

  async getNextTask(
    { user, completedTask }: { user: User; completedTask: Task },
  ): Promise<{ nextTask?: Task } | { error: string }> {
    const allTasks = await this.scheduledTasks.find({ owner: user }, {
      sort: { plannedStart: 1 },
    }).toArray();

    const completedIndex = allTasks.findIndex((t) => t.task === completedTask);

    if (completedIndex === -1) {
      return { error: "Completed task not found in schedule." };
    }
    if (completedIndex === allTasks.length - 1) {
      return { nextTask: undefined }; // This was the last task
    }
    return { nextTask: allTasks[completedIndex + 1].task };
  }

  async clearDay({ user }: { user: User }): Promise<Empty> {
    // Deletes all tasks for a user scheduled for "today"
    const now = this.timeProvider();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = getEndOfDay(now);

    await this.scheduledTasks.deleteMany({
      owner: user,
      plannedStart: { $gte: startOfDay, $lte: endOfDay },
    });
    return {};
  }

  async deleteAllForUser({ user }: { user: User }): Promise<Empty> {
    await this.scheduledTasks.deleteMany({ owner: user });
    return {};
  }

  /**
   * @query _getScheduledTasks
   * Retrieves all scheduled tasks for a given user.
   */
  async _getScheduledTasks(
    { user }: { user: User },
  ): Promise<{ tasks: ScheduledTask[] }[]> {
    const tasks = await this.scheduledTasks
      .find({ owner: user }, {
        sort: { plannedStart: 1 },
      })
      .toArray();
    return [{ tasks }];
  }

  /**
   * Core scheduling logic to fit tasks into available time slots.
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

### 2. The Fixed Test File

With the concept now behaving as expected, we only need to update the test to correctly handle the array returned by `_getScheduledTasks`.
