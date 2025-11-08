---
timestamp: 'Fri Nov 07 2025 11:09:29 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_110929.1d2fc5b1.md]]'
content_id: 651f425218c6dd85a78dbed24229bc77d6ba52b90a9eb89d73bb7d062ae1da14
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

/**
 * @sync GetScheduledTasks
 * @when a request is made to get a user's planned tasks for a specific date
 * @where the session is valid
 * @then the scheduled tasks are returned.
 */
export const GetScheduledTasks: Sync = ({ request, session, user, date, scheduledTasks }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Planner/_getScheduledTasks", session, date },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames; // Unauthorized
    // This will now work because the PlannerConcept's query is implemented correctly.
    return await frames.query(Planner._getScheduledTasks, { owner: user, date }, { scheduledTasks });
  },
  then: actions([Requesting.respond, { request, scheduledTasks }]),
});

/**
 * =============================================================================
 * ACTIONS - Modifying Planner Data
 * =============================================================================
 */

// --- PLAN DAY / REPLAN ---
// This is a key example of a sync orchestrating multiple concepts.
// The logic is identical for both plan and replan, so we can create a helper.

const planOrReplanWhere = async (frames: any, { user, date, dayStart, dayEnd, slots, tasksToSchedule }: any) => {
  // 1. Authorize the request
  frames = await frames.query(Sessioning._getUser, { session: frames[0].get("session") }, { user });
  if (frames.length === 0) return frames;

  const frame = frames[0];
  const owner = frame[user];
  const dayDate = frame[date];
  const startHour = parseInt(frame[dayStart] as string);
  const endHour = parseInt(frame[dayEnd] as string);

  const start = new Date(dayDate as string);
  start.setUTCHours(startHour, 0, 0, 0);

  const end = new Date(dayDate as string);
  end.setUTCHours(endHour, 0, 0, 0);
  
  // 2. Orchestrate: Fetch data from Schedule concept
  frames = await frames.query(Schedule._getSlots, { owner, start, end }, { slots });

  // 3. Orchestrate: Fetch data from Tasks concept
  return await frames.query(Tasks._getRemainingTasks, { owner }, { tasksToSchedule });
};

export const PlanDayRequest: Sync = ({ request, session, user, date, dayStart, dayEnd, slots, tasksToSchedule }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Planner/planDay", session, date, dayStart, dayEnd },
    { request },
  ]),
  where: (frames) => planOrReplanWhere(frames, { user, date, dayStart, dayEnd, slots, tasksToSchedule }),
  then: actions([
    Planner.planDay,
    { user, date, dayStart, dayEnd, existingSchedule: slots, tasksToSchedule },
  ]),
});

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

export const ReplanRequest: Sync = ({ request, session, user, date, dayStart, dayEnd, slots, tasksToSchedule }) => ({
    when: actions([
      Requesting.request,
      { path: "/api/Planner/replan", session, date, dayStart, dayEnd },
      { request },
    ]),
    where: (frames) => planOrReplanWhere(frames, { user, date, dayStart, dayEnd, slots, tasksToSchedule }),
    then: actions([
      Planner.replan,
      { user, date, dayStart, dayEnd, existingSchedule: slots, tasksToSchedule },
    ]),
  });
  
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

***

Second, here is the full implementation of the `PlannerConcept`, with a simple scheduling algorithm and correctly formatted queries.
