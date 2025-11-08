---
timestamp: 'Fri Nov 07 2025 11:11:56 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_111156.4992c5c1.md]]'
content_id: b801c958528421669b916ac8d3380be43688593b54db6c9dfd5a4b426d2dcf56
---

# file: src/concepts/Planner/PlannerConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Planner" + ".";

type User = ID;
type Task = ID;
type PlannedTask = ID;

/**
 * @concept Planner
 * @purpose To automatically schedule a user's tasks into available time slots.
 * @principle Given a list of tasks and a schedule of blocked-off time, the planner can generate an agenda for the day.
 */

// A document representing a task that has been scheduled by the planner.
interface PlannedTaskDocument {
  _id: PlannedTask;
  owner: User;
  taskId: Task;
  date: string; // YYYY-MM-DD
  startTime: Date;
  endTime: Date;
}

// Minimal shape of a task from the Tasks concept needed for planning.
interface TaskForPlanning {
  _id: Task;
  duration: number; // in minutes
}

// Minimal shape of a slot from the Schedule concept.
interface ExistingSlot {
  startTime: Date;
  endTime: Date;
}

export default class PlannerConcept {
  private plannedTasks: Collection<PlannedTaskDocument>;

  constructor(db: Db) {
    this.plannedTasks = db.collection(PREFIX + "plannedTasks");
  }

  async planDay(
    { user, date, dayStart, dayEnd, tasksToSchedule, existingSchedule }: {
      user: User;
      date: string;
      dayStart: string;
      dayEnd: string;
      tasksToSchedule: TaskForPlanning[];
      existingSchedule: ExistingSlot[];
    },
  ): Promise<{ newPlan: PlannedTaskDocument[] } | { error: string }> {
    
    // This is a simplified scheduling algorithm.
    // 1. Define the planning window.
    const dayStartTime = new Date(`${date}T${dayStart}:00.000Z`);
    const dayEndTime = new Date(`${date}T${dayEnd}:00.000Z`);

    // 2. Combine all existing blocks.
    const allBlocks = [...existingSchedule].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    const newPlan: PlannedTaskDocument[] = [];
    let currentTime = dayStartTime;

    // 3. Iterate through tasks and find the next available slot.
    for (const task of tasksToSchedule) {
      const taskDurationMs = task.duration * 60 * 1000;
      let slotFound = false;

      while (currentTime < dayEndTime && !slotFound) {
        const potentialEndTime = new Date(currentTime.getTime() + taskDurationMs);
        if (potentialEndTime > dayEndTime) break; // Task doesn't fit in the day

        // Check for overlap with existing blocks
        const overlap = allBlocks.find(block => 
            Math.max(currentTime.getTime(), new Date(block.startTime).getTime()) < Math.min(potentialEndTime.getTime(), new Date(block.endTime).getTime())
        );

        if (!overlap) {
          const newPlannedTask: PlannedTaskDocument = {
            _id: freshID(),
            owner: user,
            taskId: task._id,
            date: date,
            startTime: new Date(currentTime),
            endTime: potentialEndTime,
          };
          newPlan.push(newPlannedTask);
          allBlocks.push({ startTime: newPlannedTask.startTime, endTime: newPlannedTask.endTime });
          allBlocks.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          
          currentTime = potentialEndTime;
          slotFound = true;
        } else {
          // Move current time to the end of the overlapping block
          currentTime = new Date(overlap.endTime);
        }
      }
    }

    if (newPlan.length > 0) {
      await this.plannedTasks.insertMany(newPlan);
    }

    return { newPlan };
  }

  async replan(
    { user, date, dayStart, dayEnd, tasksToSchedule, existingSchedule }: {
      user: User;
      date: string;
      dayStart: string;
      dayEnd: string;
      tasksToSchedule: TaskForPlanning[];
      existingSchedule: ExistingSlot[];
    },
  ): Promise<{ newPlan: PlannedTaskDocument[] } | { error: string }> {
    // For replanning, we first clear the old plan for that day.
    await this.plannedTasks.deleteMany({ owner: user, date });
    return this.planDay({ user, date, dayStart, dayEnd, tasksToSchedule, existingSchedule });
  }

  async clearDay({ user, date }: { user: User; date: string }): Promise<Empty> {
    await this.plannedTasks.deleteMany({ owner: user, date });
    return {};
  }

  async deleteAllForUser({ user }: { user: User }): Promise<Empty> {
    await this.plannedTasks.deleteMany({ owner: user });
    return {};
  }
  
  /**
   * @query _getScheduledTasks (owner: User, date: String): (scheduledTasks: PlannedTaskDocument[])
   * @returns All tasks planned for a specific date.
   */
  async _getScheduledTasks(
    { owner, date }: { owner: User; date: string },
  ): Promise<{ scheduledTasks: PlannedTaskDocument[] }[]> {
    const tasks = await this.plannedTasks.find({ owner, date }).sort({ startTime: 1 }).toArray();
    // CORRECT: Return the result wrapped in an array with the key 'scheduledTasks'.
    return [{ scheduledTasks: tasks }];
  }
}
```

### 3. The Fully Orchestrated `Planner` Synchronization

Finally, here is the corrected `planner.sync.ts`. It now correctly gathers data from `Sessioning`, `Schedule`, AND `Tasks` before calling the `Planner` concept, demonstrating the full power of the synchronization layer.
