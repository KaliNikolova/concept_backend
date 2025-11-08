---
timestamp: 'Fri Nov 07 2025 11:09:29 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_110929.1d2fc5b1.md]]'
content_id: e6ae601c2c199548a6d5af55ba7db02f95cd51e0003c8d8537e84937cc2ff59b
---

# file: src/concepts/Planner/PlannerConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Planner" + ".";

type User = ID;
type Task = ID;
type Plan = ID;

/**
 * @concept Planner
 * @purpose Automatically schedule a user's tasks for the day around their existing commitments.
 * @principle A user can generate a plan for their day, which intelligently slots their tasks into available time.
 */

/**
 * @state a set of Plans with
 *  an owner User
 *  a task Task
 *  a date Date
 *  a startTime Date
 *  a endTime Date
 */
interface PlanDocument {
  _id: Plan;
  owner: User;
  task: Task;
  date: Date;
  startTime: Date;
  endTime: Date;
}

// Interfaces for data passed in from syncs
interface TaskToSchedule {
  _id: Task;
  duration: number;
}
interface ExistingSlot {
  startTime: Date;
  endTime: Date;
}

export default class PlannerConcept {
  private plans: Collection<PlanDocument>;
  private tasksCollectionName: string = "Tasks.tasks"; // For $lookup

  constructor(db: Db) {
    this.plans = db.collection(PREFIX + "plans");
  }

  private async _generatePlan(
    user: User,
    date: string,
    dayStart: string,
    dayEnd: string,
    existingSchedule: ExistingSlot[],
    tasksToSchedule: { tasks: TaskToSchedule[] }[],
  ) {
    // 1. Clear any existing plan for this day
    await this.clearDay({ user, date });

    // 2. Define the planning window
    const planDate = new Date(date);
    planDate.setUTCHours(0, 0, 0, 0);
    const dayStartTime = new Date(planDate);
    dayStartTime.setUTCHours(parseInt(dayStart), 0, 0, 0);
    const dayEndTime = new Date(planDate);
    dayEndTime.setUTCHours(parseInt(dayEnd), 0, 0, 0);

    // 3. Simple Greedy Scheduling Algorithm
    let currentTime = dayStartTime;
    const newPlan: PlanDocument[] = [];
    const tasks = tasksToSchedule[0]?.tasks ?? [];

    for (const task of tasks) {
      const taskDurationMs = task.duration * 60 * 1000;
      let slotFound = false;

      while (!slotFound && currentTime.getTime() + taskDurationMs <= dayEndTime.getTime()) {
        const potentialEndTime = new Date(currentTime.getTime() + taskDurationMs);
        
        // Check for conflicts with existing schedule
        const conflict = existingSchedule.some(slot =>
          currentTime < new Date(slot.endTime) && potentialEndTime > new Date(slot.startTime)
        );

        if (!conflict) {
          // Found a valid slot
          newPlan.push({
            _id: freshID(),
            owner: user,
            task: task._id,
            date: planDate,
            startTime: new Date(currentTime),
            endTime: potentialEndTime,
          });
          currentTime = potentialEndTime; // Move currentTime to the end of this task
          slotFound = true;
        } else {
          // Move currentTime to the end of the conflicting slot to find the next opening
          const conflictingSlot = existingSchedule.find(slot =>
            currentTime < new Date(slot.endTime) && potentialEndTime > new Date(slot.startTime)
          );
          if (conflictingSlot) {
            currentTime = new Date(conflictingSlot.endTime);
          } else {
            // Should not happen, but as a fallback, increment by a minute
            currentTime.setMinutes(currentTime.getMinutes() + 1);
          }
        }
      }
    }
    
    // 4. Save the new plan
    if (newPlan.length > 0) {
      await this.plans.insertMany(newPlan);
    }
    
    return { newPlan };
  }

  async planDay(
    args: {
      user: User;
      date: string;
      dayStart: string;
      dayEnd: string;
      existingSchedule: ExistingSlot[];
      tasksToSchedule: { tasks: TaskToSchedule[] }[];
    },
  ) {
    return this._generatePlan(args.user, args.date, args.dayStart, args.dayEnd, args.existingSchedule, args.tasksToSchedule);
  }

  async replan(
    args: {
      user: User;
      date: string;
      dayStart: string;
      dayEnd: string;
      existingSchedule: ExistingSlot[];
      tasksToSchedule: { tasks: TaskToSchedule[] }[];
    },
  ) {
    // For this simple model, replan is identical to plan.
    return this._generatePlan(args.user, args.date, args.dayStart, args.dayEnd, args.existingSchedule, args.tasksToSchedule);
  }

  async clearDay({ user, date }: { user: User; date: string }): Promise<Empty> {
    const planDate = new Date(date);
    planDate.setUTCHours(0, 0, 0, 0);
    await this.plans.deleteMany({ owner: user, date: planDate });
    return {};
  }
  
  // A sync would call this on UserAccount.deleteAccount
  async deleteAllForUser({ user }: { user: User }): Promise<Empty> {
    await this.plans.deleteMany({ owner: user });
    return {};
  }

  /**
   * @query _getScheduledTasks (owner: User, date: Date): (scheduledTasks: Plan[])
   * @returns All planned tasks for a user on a given day, with task details joined.
   */
  async _getScheduledTasks(
    { owner, date }: { owner: User; date: string },
  ): Promise<{ scheduledTasks: any[] }[]> {
    const planDate = new Date(date);
    planDate.setUTCHours(0, 0, 0, 0);

    const pipeline = [
      { $match: { owner, date: planDate } },
      {
        $lookup: {
          from: this.tasksCollectionName,
          localField: 'task',
          foreignField: '_id',
          as: 'taskDetails'
        }
      },
      { $unwind: '$taskDetails' },
      { $sort: { startTime: 1 } },
      {
        $project: {
          _id: 1,
          startTime: 1,
          endTime: 1,
          task: {
            _id: '$taskDetails._id',
            title: '$taskDetails.title',
            description: '$taskDetails.description',
            duration: '$taskDetails.duration',
            completed: '$taskDetails.completed'
          }
        }
      }
    ];

    const results = await this.plans.aggregate(pipeline).toArray();
    // CORRECT: Return result wrapped in an array with the 'scheduledTasks' key.
    return [{ scheduledTasks: results }];
  }
}
```
