---
timestamp: 'Fri Nov 07 2025 13:39:30 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_133930.d96b46a7.md]]'
content_id: 5031d7379621e1b6eb2486ef6ada2c0125b1b81a38d0ce37cf68eb75aab2fe26
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

// Interfaces based on the test file's usage
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
  private timeProvider: () => Date;

  constructor(db: Db, timeProvider: () => Date = () => new Date()) {
    this.scheduledTasks = db.collection(PREFIX + "scheduledTasks");
    this.timeProvider = timeProvider;
  }

  private _getAvailableSlots(start: DateTime, busySlots: BusySlot[]): BusySlot[] {
    const availableSlots: BusySlot[] = [];
    let cursor = new Date(start);

    // Day ends at midnight
    const dayEnd = new Date(start);
    dayEnd.setHours(23, 59, 59, 999);

    const sortedBusy = busySlots.sort((a, b) => a.start.getTime() - b.start.getTime());

    for (const busy of sortedBusy) {
      if (busy.start > cursor) {
        availableSlots.push({ start: cursor, end: busy.start });
      }
      cursor = new Date(Math.max(cursor.getTime(), busy.end.getTime()));
    }

    if (cursor < dayEnd) {
      availableSlots.push({ start: cursor, end: dayEnd });
    }
    return availableSlots;
  }

  private async _scheduleTasks(user: User, tasks: TaskWithDuration[], busySlots: BusySlot[]): Promise<{ firstTask?: Task }> {
    const now = this.timeProvider();
    const availableSlots = this._getAvailableSlots(now, busySlots);
    const newScheduledTasks: ScheduledTask[] = [];

    for (const task of tasks) {
      const taskDurationMillis = task.duration * 60 * 1000;
      for (const slot of availableSlots) {
        const slotDurationMillis = slot.end.getTime() - slot.start.getTime();
        if (slotDurationMillis >= taskDurationMillis) {
          const plannedStart = slot.start;
          const plannedEnd = new Date(plannedStart.getTime() + taskDurationMillis);
          newScheduledTasks.push({
            _id: freshID(),
            owner: user,
            task: task.id,
            plannedStart,
            plannedEnd,
          });
          slot.start = plannedEnd; // Consume this part of the slot
          break; // Move to next task
        }
      }
    }

    if (newScheduledTasks.length > 0) {
      await this.scheduledTasks.insertMany(newScheduledTasks);
    }
    return { firstTask: newScheduledTasks.length > 0 ? newScheduledTasks[0].task : undefined };
  }

  async planDay({ user, tasks, busySlots }: { user: User; tasks: TaskWithDuration[]; busySlots: BusySlot[] }): Promise<{ firstTask?: Task } | { error: string }> {
    await this.scheduledTasks.deleteMany({ owner: user });
    return this._scheduleTasks(user, tasks, busySlots);
  }

  async replan({ user, tasks, busySlots }: { user: User; tasks: TaskWithDuration[]; busySlots: BusySlot[] }): Promise<{ firstTask?: Task } | { error: string }> {
    const now = this.timeProvider();
    await this.scheduledTasks.deleteMany({ owner: user, plannedStart: { $gte: now } });
    return this._scheduleTasks(user, tasks, busySlots);
  }

  async clearDay({ user }: { user: User }): Promise<Empty> {
    await this.scheduledTasks.deleteMany({ owner: user });
    return {};
  }

  async deleteAllForUser({ user }: { user: User }): Promise<Empty> {
    await this.scheduledTasks.deleteMany({ owner: user });
    return {};
  }

  async getNextTask({ user, completedTask }: { user: User; completedTask: Task }): Promise<{ nextTask?: Task } | { error:string }> {
    const allTasks = await this.scheduledTasks.find({ owner: user }).sort({ plannedStart: 1 }).toArray();
    const completedIndex = allTasks.findIndex(t => t.task === completedTask);

    if (completedIndex === -1) {
      return { error: "Completed task not found in schedule." };
    }
    if (completedIndex + 1 < allTasks.length) {
      return { nextTask: allTasks[completedIndex + 1].task };
    }
    return { nextTask: undefined };
  }

  async _getScheduledTasks({ user }: { user: User }): Promise<{ tasks: ScheduledTask[] }[]> {
    const tasks = await this.scheduledTasks.find({ owner: user }).sort({ plannedStart: 1 }).toArray();
    return [{ tasks }];
  }
}
```

Now, with a concept that implements the expected behavior, we can make the one small but crucial fix to the test file to correctly handle the query's return type.
