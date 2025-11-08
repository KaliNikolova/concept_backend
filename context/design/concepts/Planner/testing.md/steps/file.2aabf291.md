---
timestamp: 'Fri Nov 07 2025 13:45:03 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_134503.2cb45763.md]]'
content_id: 2aabf29147a342853087593719cf52e6be7a5cfbc4d66238037d9c5e50a3b138
---

# file: src/concepts/Planner/PlannerConcept.test.ts

```typescript
import { assertEquals, assert } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import PlannerConcept from "./PlannerConcept.ts";

// Helper to create dates on today's date for deterministic testing
function todayAt(hours: number, minutes = 0, seconds = 0): Date {
  const d = new Date();
  d.setHours(hours, minutes, seconds, 0);
  return d;
}

// A fixed point in time for all tests to run against. We'll pretend "now" is always 9 AM.
const MOCK_NOW = todayAt(9, 0, 0);
const MOCK_TIME_PROVIDER = () => MOCK_NOW;

Deno.test("PlannerConcept: Operational Principle", async () => {
  console.log("\n--- TRACE: Operational Principle ---");
  const [db, client] = await testDb();
  // Inject the mock time provider
  const planner = new PlannerConcept(db, MOCK_TIME_PROVIDER);

  try {
    const user = "user:alice" as ID;
    const task1 = "task:write-report" as ID;
    const task2 = "task:review-code" as ID;
    const task3 = "task:team-meeting-prep" as ID;

    const tasksToPlan = [
      { id: task1, duration: 120 }, // 2 hours (9am -> 11am)
      { id: task2, duration: 90 }, // 1.5 hours (11am -> 12:30pm)
      { id: task3, duration: 30 }, // 0.5 hours (1:30pm -> 2pm)
    ];

    // Busy from 12:30pm to 1:30pm
    const busySlots = [{ start: todayAt(12, 30), end: todayAt(13, 30) }];

    console.log(`1. Planning day for user '${user}' at mock time ${MOCK_NOW.toLocaleTimeString()}`);
    const planResult = await planner.planDay({ user, tasks: tasksToPlan, busySlots });
    console.log(" > planDay result:", planResult);

    assert("firstTask" in planResult, "planDay should not return an error");
    assertEquals(planResult.firstTask, task1);

    // This test is about the user flow, so using getNextTask is appropriate here.
    console.log(`2. Getting task after '${task1}'.`);
    const nextAfter1 = await planner.getNextTask({ user, completedTask: task1 });
    console.log(" > getNextTask result:", nextAfter1);
    assert("nextTask" in nextAfter1);
    assertEquals(nextAfter1.nextTask, task2);

    console.log(`3. Getting task after '${task2}'.`);
    const nextAfter2 = await planner.getNextTask({ user, completedTask: task2 });
    console.log(" > getNextTask result:", nextAfter2);
    assert("nextTask" in nextAfter2);
    assertEquals(nextAfter2.nextTask, task3);

    console.log(`4. Getting task after '${task3}'.`);
    const nextAfter3 = await planner.getNextTask({ user, completedTask: task3 });
    console.log(" > getNextTask result:", nextAfter3);
    assert("nextTask" in nextAfter3);
    assertEquals(nextAfter3.nextTask, undefined);
  } finally {
    await client.close();
  }
});

Deno.test("PlannerConcept: Interesting Scenarios", async (t) => {
  await t.step("Scenario 1: Replan mid-day after some tasks are done", async () => {
    console.log("\n--- SCENARIO: Replan mid-day ---");
    const [db, client] = await testDb();
    try {
      const user = "user:bob" as ID;

      // Step 1: Initial plan at 9 AM, with tasks both before and after the replan time.
      const planner_morning = new PlannerConcept(db, () => todayAt(9, 0));
      const originalTasks = [
        { id: "task:morning-work" as ID, duration: 60 }, // Scheduled 9am -> 10am
        { id: "task:afternoon-work" as ID, duration: 60 }, // Scheduled 2pm -> 3pm
      ];
      const busySlots = [{ start: todayAt(10, 0), end: todayAt(14, 0) }]; // Long break
      await planner_morning.planDay({ user, tasks: originalTasks, busySlots });

      // Step 2: Replan at 1 PM (13:00)
      const planner_afternoon = new PlannerConcept(db, () => todayAt(13, 0));
      const newTasks = [{ id: "task:urgent-fix" as ID, duration: 60 }];

      console.log(`1. Replanning for user '${user}' at mock time 1:00 PM`);
      await planner_afternoon.replan({ user, tasks: newTasks, busySlots: [] });

      // Step 3: Verify the final state using the _getScheduledTasks query
      const result = await planner_afternoon._getScheduledTasks({ user });
      assert(result.length === 1, "Query should return one result object");
      const finalTaskIds = result[0].tasks.map((t) => t.task);

      assert(finalTaskIds.includes("task:morning-work"), "Morning task (before replan) should be preserved.");
      assert(!finalTaskIds.includes("task:afternoon-work"), "Afternoon task (after replan) should be deleted.");
      assert(finalTaskIds.includes("task:urgent-fix"), "New task from replan should be scheduled.");
    } finally {
      await client.close();
    }
  });

  await t.step("Scenario 2: Not enough time left to schedule all tasks", async () => {
    console.log("\n--- SCENARIO: Not enough time ---");
    const [db, client] = await testDb();
    // Pretend it's 11 PM (23:00). We have less than an hour left.
    const planner = new PlannerConcept(db, () => todayAt(23, 0));
    try {
      const user = "user:charlie" as ID;
      const tasks = [
        { id: "task:short-1" as ID, duration: 30 }, // 30 mins, fits
        { id: "task:long-1" as ID, duration: 60 }, // 1 hour, does not fit
      ];
      console.log(`1. Planning day for '${user}' late in the evening.`);
      await planner.planDay({ user, tasks, busySlots: [] });

      const result = await planner._getScheduledTasks({ user });
      const scheduledTasks = result[0].tasks;

      assertEquals(scheduledTasks.length, 1, "Only tasks that fit should be scheduled.");
      assertEquals(scheduledTasks[0].task, "task:short-1", "The fitting task should be present.");
    } finally {
      await client.close();
    }
  });

  await t.step("Scenario 3: Clearing and deleting plans", async () => {
    console.log("\n--- SCENARIO: Clear and delete ---");
    const [db, client] = await testDb();
    const planner = new PlannerConcept(db, MOCK_TIME_PROVIDER);
    try {
      const userA = "user:diana" as ID;
      const userB = "user:edward" as ID;
      const tasks = [{ id: "task:generic" as ID, duration: 60 }];

      await planner.planDay({ user: userA, tasks, busySlots: [] });
      await planner.planDay({ user: userB, tasks, busySlots: [] });

      // Clear day for User A
      await planner.clearDay({ user: userA });
      const afterClear = await planner._getScheduledTasks({ user: userA });
      assertEquals(afterClear[0].tasks.length, 0, "User A's plan should be gone after clearDay.");

      const userBCheck = await planner._getScheduledTasks({ user: userB });
      assertEquals(userBCheck[0].tasks.length, 1, "User B's plan should remain.");

      // Delete all for User B
      await planner.deleteAllForUser({ user: userB });
      const afterDelete = await planner._getScheduledTasks({ user: userB });
      assertEquals(afterDelete[0].tasks.length, 0, "User B's plan should be gone after deleteAllForUser.");
    } finally {
      await client.close();
    }
  });

  await t.step("Scenario 4: Querying the full schedule for a user", async () => {
    console.log("\n--- SCENARIO: Querying the schedule ---");
    const [db, client] = await testDb();
    const planner = new PlannerConcept(db, MOCK_TIME_PROVIDER);
    try {
      const user = "user:query-user" as ID;
      const tasksToPlan = [
        { id: "task:query-2" as ID, duration: 60 },
        { id: "task:query-1" as ID, duration: 30 },
      ];

      // First, query for a user with no plan
      const emptyResult = await planner._getScheduledTasks({ user });
      assert(emptyResult.length === 1 && emptyResult[0].tasks.length === 0, "Should return an empty task list for new user");

      // Now plan the day
      await planner.planDay({ user, tasks: tasksToPlan, busySlots: [] });

      // Query again
      const result = await planner._getScheduledTasks({ user });
      assert(result.length === 1, "Query should return one result object");
      const scheduledTasks = result[0].tasks;

      assertEquals(scheduledTasks.length, 2, "Should return all scheduled tasks");
      // Verify tasks are sorted by plannedStart time, which follows the input order
      assertEquals(scheduledTasks[0].task, "task:query-2", "Tasks should be in chronological order");
      assertEquals(scheduledTasks[1].task, "task:query-1", "Tasks should be in chronological order");
    } finally {
      await client.close();
    }
  });
});
```
