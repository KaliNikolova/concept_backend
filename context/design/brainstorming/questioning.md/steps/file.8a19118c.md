---
timestamp: 'Fri Nov 07 2025 11:11:56 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_111156.4992c5c1.md]]'
content_id: 8a19118cffeae52679b0218656b0f057d0c93afbe8aaccf61fbbc304b86f6782
---

# file: src/syncs/planner.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, Planner, Schedule, Tasks } from "@concepts";

/**
 * =============================================================================
 * QUERIES - Reading Planner Data
 * =============================================================================
 */

export const GetScheduledTasks: Sync = ({ request, session, user, date, scheduledTasks }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Planner/_getScheduledTasks", session, date },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames;
    // This now works because the concept query is correct
    return await frames.query(Planner._getScheduledTasks, { owner: user, date }, { scheduledTasks });
  },
  then: actions([Requesting.respond, { request, scheduledTasks }]),
});

/**
 * =============================================================================
 * ACTIONS - Orchestrating and Modifying Planner Data
 * =============================================================================
 */

// --- PLAN DAY / REPLAN ---
// This sync orchestrates Sessioning, Schedule, and Tasks to provide the Planner concept with everything it needs.

const planDayOrReplanSync = (path: "/api/Planner/planDay" | "/api/Planner/replan"): Sync => 
  ({ request, session, user, date, dayStart, dayEnd, slots, tasksToSchedule }) => ({
  when: actions([
    Requesting.request,
    { path, session, date, dayStart, dayEnd },
    { request },
  ]),
  where: async (frames) => {
    // 1. Authorize the request
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames;

    // 2. Get existing schedule from the Schedule concept
    const frame = frames[0];
    const start = new Date(`${frame[date]}T${frame[dayStart]}:00.000Z`);
    const end = new Date(`${frame[date]}T${frame[dayEnd]}:00.000Z`);
    frames = await frames.query(Schedule._getSlots, { owner: user, start, end }, { slots });

    // 3. Get remaining tasks to be scheduled from the Tasks concept
    return await frames.query(Tasks._getRemainingTasks, { owner: user }, { tasksToSchedule });
  },
  then: actions([
    // 4. Call the correct Planner action with all the orchestrated data
    path === "/api/Planner/planDay" ? Planner.planDay : Planner.replan,
    { user, date, dayStart, dayEnd, existingSchedule: slots, tasksToSchedule },
  ]),
});

export const PlanDayRequest = planDayOrReplanSync("/api/Planner/planDay");
export const ReplanRequest = planDayOrReplanSync("/api/Planner/replan");

// --- Responses for PlanDay ---
export const PlanDayResponse: Sync = ({ request, newPlan }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Planner/planDay" }, { request }],
    [Planner.planDay, {}, { newPlan }],
  ),
  then: actions([Requesting.respond, { request, newPlan }]),
});
export const PlanDayError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Planner/planDay" }, { request }],
    [Planner.planDay, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Responses for Replan ---
export const ReplanResponse: Sync = ({ request, newPlan }) => ({
    when: actions(
      [Requesting.request, { path: "/api/Planner/replan" }, { request }],
      [Planner.replan, {}, { newPlan }],
    ),
    then: actions([Requesting.respond, { request, newPlan }]),
  });
export const ReplanError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Planner/replan" }, { request }],
    [Planner.replan, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


// --- CLEAR DAY ---
export const ClearDayRequest: Sync = ({ request, session, user, date }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Planner/clearDay", session, date },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Planner.clearDay, { user, date }]),
});
export const ClearDayResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Planner/clearDay" }, { request }],
    [Planner.clearDay, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});
export const ClearDayError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Planner/clearDay" }, { request }],
    [Planner.clearDay, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
