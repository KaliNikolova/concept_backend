---
timestamp: 'Fri Nov 07 2025 11:15:07 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_111507.08180628.md]]'
content_id: e4f19313af95ed8ba03ec646f95ab76cadec26a37c31788fcf0baad2616335ee
---

# file: src/concepts/Planner/PlannerConcept.ts

```typescript
import { Collection, Db, ObjectId } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Planner" + ".";

type User = ID;
type Task = ID;
type Slot = ID;

/**
 * @concept Planner
 * @purpose To automatically schedule a user's tasks for a given day around their existing commitments.
 * @principle A user provides their tasks and blocked times, and the planner generates an optimal schedule.
 */

/**
 * @state a set of PlannedSlots with
 *  an owner User
 *  a task Task
 *  a date String (YYYY-MM-DD)
 *  a startTime Date
 *  a endTime Date
 */
interface PlannedSlotDocument {
  _id: Slot;
  owner: User;
  task: Task;
  date: string; // YYYY-MM-DD format
  startTime: Date;
  endTime: Date;
}

// A simple representation of a task needed for planning.
interface TaskToSchedule {
  _id: Task;
  duration: number; // in minutes
}

// A simple representation of an existing calendar event.
interface ExistingSlot {
  startTime: Date;
  endTime: Date;
}

export default class PlannerConcept {
  private plannedSlots: Collection<PlannedSlotDocument>;

  constructor(db: Db) {
    this.plannedSlots = db.collection(PREFIX + "plannedSlots");
  }

  /**
   * Clears all previously planned tasks for a user on a specific date.
   */
  async clearDay({ user, date }: { user: User; date: string }): Promise<Empty> {
    await this.plannedSlots.deleteMany({ owner: user, date });
    return {};
  }

  /**
   * Re-plans a day, which is an alias for clearing then planning.
   */
  async replan(
    args: {
      user: User;
      date: string;
      dayStart: string;
      dayEnd: string;
      existingSchedule: ExistingSlot[];
      tasksToSchedule: TaskToSchedule[];
    },
  ): Promise<{ newPlan: PlannedSlotDocument[] } | { error: string }> {
    await this.clearDay({ user: args.user, date: args.date });
    return this.planDay(args);
  }

  /**
   * @action planDay
   * @description A simplified planning algorithm.
   */
  async planDay(
    { user, date, dayStart, dayEnd, existingSchedule, tasksToSchedule }: {
      user: User;
      date: string;
      dayStart: string; // e.g., "09"
      dayEnd: string; // e.g., "17"
      existingSchedule: ExistingSlot[];
      tasksToSchedule: TaskToSchedule[];
    },
  ): Promise<{ newPlan: PlannedSlotDocument[] } | { error: string }> {
    // 1. Define the planning window for the day
    const dayStartTime = new Date(`${date}T${dayStart}:00:00`);
    const dayEndTime = new Date(`${date}T${dayEnd}:00:00`);

    // 2. Consolidate all blocked times
    const allBlockedTimes = [...existingSchedule].sort((a, b) =>
      a.startTime.getTime() - b.startTime.getTime()
    );

    let currentTime = dayStartTime;
    const newPlan: PlannedSlotDocument[] = [];

    // 3. Iterate through tasks and find the first available slot for each
    for (const task of tasksToSchedule) {
      let slotFound = false;
      while (currentTime < dayEndTime && !slotFound) {
        const potentialEndTime = new Date(
          currentTime.getTime() + task.duration * 60000,
        );

        if (potentialEndTime > dayEndTime) {
          break; // Task doesn't fit in the remaining day
        }

        // Check for overlap with existing blocked times
        const isOverlap = allBlockedTimes.some((blocked) =>
          (currentTime < blocked.endTime) && (potentialEndTime > blocked.startTime)
        );

        if (!isOverlap) {
          // Found a free slot!
          const plannedSlot: PlannedSlotDocument = {
            _id: freshID(),
            owner: user,
            task: task._id,
            date,
            startTime: new Date(currentTime),
            endTime: potentialEndTime,
          };
          newPlan.push(plannedSlot);
          allBlockedTimes.push({ // Add this newly planned task as a blocked slot for subsequent tasks
            startTime: plannedSlot.startTime,
            endTime: plannedSlot.endTime,
          });
          allBlockedTimes.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
          currentTime = potentialEndTime; // Move current time to the end of this task
          slotFound = true;
        } else {
          // Move to the end of the conflicting block to check for the next slot
          const conflictingBlock = allBlockedTimes.find((blocked) =>
            (currentTime < blocked.endTime) && (potentialEndTime > blocked.startTime)
          );
          currentTime = conflictingBlock!.endTime;
        }
      }
    }

    if (newPlan.length > 0) {
      await this.plannedSlots.insertMany(newPlan);
    }

    return { newPlan };
  }


  /**
   * @query _getScheduledTasks
   * @returns All tasks planned for a user on a given date.
   */
  async _getScheduledTasks(
    { owner, date }: { owner: User; date: string },
  ): Promise<{ scheduledTasks: PlannedSlotDocument[] }[]> {
    const tasks = await this.plannedSlots.find({ owner, date }).sort({
      startTime: 1,
    }).toArray();
    // CORRECT: Return result wrapped in an array, with the key 'scheduledTasks'
    return [{ scheduledTasks: tasks }];
  }
}
```

***

Now, here is the improved `planner.sync.ts` file. It correctly queries `Sessioning`, `Schedule`, AND `Tasks` to gather all necessary information before calling the `Planner` concept, perfectly demonstrating the role of syncs as orchestrators.
