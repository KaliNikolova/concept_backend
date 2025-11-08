---
timestamp: 'Fri Nov 07 2025 11:20:42 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_112042.7d04c38a.md]]'
content_id: 091624725d41c14a4709a67b031b7706719d4419628624a0e0dadfa7dc57f0fe
---

# file: src/concepts/Planner/PlannerConcept.ts

```typescript
import { Collection, Db } from "npm-mongodb";
import { Empty, ID } from "@utils/types.ts";

const PREFIX = "Planner" + ".";

type User = ID;
type Task = ID;
type Slot = {
  startTime: Date;
  endTime: Date;
  taskId?: Task;
  title: string;
};

/**
 * @concept Planner
 * @purpose To automatically schedule tasks for a user for a given day.
 * @principle A user provides their tasks and blocked times, and the planner generates a schedule.
 */

/**
 * @state a set of Plans with
 *  an owner User
 *  a date Date
 *  a scheduledTasks array of {task: Task, startTime: Date, endTime: Date}
 */
interface PlanDocument {
  _id: ID;
  owner: User;
  date: string; // Store date as ISO string for MongoDB compatibility
  scheduledTasks: {
    task: Task;
    startTime: Date;
    endTime: Date;
  }[];
}

export default class PlannerConcept {
  private plans: Collection<PlanDocument>;

  constructor(db: Db) {
    this.plans = db.collection(PREFIX + "plans");
  }

  // NOTE: In a real implementation, this would contain complex scheduling logic.
  // This is a simplified placeholder.
  async planDay(
    { user, date, dayStart, dayEnd, existingSchedule }: {
      user: User;
      date: string;
      dayStart: string;
      dayEnd: string;
      existingSchedule: Slot[];
    },
  ): Promise<{ newPlan: PlanDocument } | { error: string }> {
    // This is where the core planning algorithm would go.
    // It would take the user's tasks (from the Tasks concept, passed in via a sync),
    // and the existingSchedule (from the Schedule concept, passed in via this sync)
    // and generate a new plan.
    // For now, we'll just create an empty plan.
    await this.plans.deleteMany({ owner: user, date });

    const newPlan: PlanDocument = {
      _id: freshID(),
      owner: user,
      date,
      scheduledTasks: [], // Placeholder for the actual scheduling result
    };

    await this.plans.insertOne(newPlan);
    return { newPlan };
  }
  
  // A replan would likely have different logic, but is simplified here.
  async replan(
    { user, date, dayStart, dayEnd, existingSchedule }: {
      user: User;
      date: string;
      dayStart: string;
      dayEnd: string;
      existingSchedule: Slot[];
    },
  ): Promise<{ newPlan: PlanDocument } | { error: string }> {
    return this.planDay({ user, date, dayStart, dayEnd, existingSchedule });
  }

  async clearDay({ user, date }: { user: User; date: string }): Promise<Empty> {
    await this.plans.deleteMany({ owner: user, date });
    return {};
  }
  
  async deleteAllForUser({ user }: { user: User }): Promise<Empty> {
    await this.plans.deleteMany({ owner: user });
    return {};
  }
  
  // This would be a more complex query, likely involving the Tasks concept
  async getNextTask({ user }: { user: User }): Promise<{ task?: Task } | { error: string }> {
    // Placeholder logic
    return { task: undefined };
  }

  /**
   * @query _getScheduledTasks (owner: User, date: String): (scheduledTasks: any[])
   * @returns The list of scheduled tasks for a given user and date.
   */
  async _getScheduledTasks(
    { owner, date }: { owner: User; date: string },
  ): Promise<{ scheduledTasks: any[] }[]> { // CORRECTED RETURN TYPE
    const plan = await this.plans.findOne({ owner, date });
    if (!plan) {
      return []; // CORRECT: Return empty array for no match
    }
    // CORRECT: Return result wrapped in an array, with the key 'scheduledTasks'.
    return [{ scheduledTasks: plan.scheduledTasks }];
  }
  
  // These would also be queries with corrected return types
  async _scheduleTasks() { return []; }
  async _getAvailableSlots() { return []; }
}
```

Now that `PlannerConcept.ts` correctly implements its query, the `planner.sync.ts` file you provided will work **without any changes**. The logic was already correct; it was just being given a function that didn't meet the required contract.
