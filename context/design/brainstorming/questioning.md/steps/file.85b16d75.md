---
timestamp: 'Fri Nov 07 2025 11:06:45 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_110645.f0596b30.md]]'
content_id: 85b16d759319a6de018032ed9765ea1f88aa030a5654ac042e413070b0bc9e76
---

# file: src/syncs/planner.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, Planner, Schedule } from "@concepts";

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
    return await frames.query(Planner._getScheduledTasks, { owner: user, date }, { scheduledTasks });
  },
  then: actions([Requesting.respond, { request, scheduledTasks }]),
});

/**
 * =============================================================================
 * ACTIONS - Modifying Planner Data
 * =============================================================================
 */

// --- PLAN DAY ---
// This is a key example of a sync orchestrating multiple concepts.

/**
 * @sync PlanDayRequest
 * @when a request is made to plan a user's day
 * @where the session is valid, and we have fetched the user's existing schedule
 * @then the Planner concept is called with all necessary info to create a plan.
 */
export const PlanDayRequest: Sync = ({ request, session, user, date, dayStart, dayEnd, slots }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Planner/planDay", session, date, dayStart, dayEnd },
    { request },
  ]),
  where: async (frames) => {
    // 1. Authorize the request
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames;

    // 2. Orchestrate: Fetch data from the Schedule concept that the Planner concept needs.
    // We pass the user-defined start/end of their planning day to get the relevant blocked slots.
    const frame = frames[0];
    const start = new Date(frame[date] as string);
    start.setHours(parseInt(frame[dayStart] as string), 0, 0, 0);

    const end = new Date(frame[date] as string);
    end.setHours(parseInt(frame[dayEnd] as string), 0, 0, 0);

    return await frames.query(Schedule._getSlots, { owner: user, start, end }, { slots });
  },
  then: actions([
    // 3. Act: Call the Planner concept, providing the fetched schedule as context.
    Planner.planDay,
    { user, date, dayStart, dayEnd, existingSchedule: slots },
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


// --- REPLAN ---
// This follows the same orchestration pattern as PlanDay.

export const ReplanRequest: Sync = ({ request, session, user, date, dayStart, dayEnd, slots }) => ({
    when: actions([
      Requesting.request,
      { path: "/api/Planner/replan", session, date, dayStart, dayEnd },
      { request },
    ]),
    where: async (frames) => {
      frames = await frames.query(Sessioning._getUser, { session }, { user });
      if (frames.length === 0) return frames;
  
      const frame = frames[0];
      const start = new Date(frame[date] as string);
      start.setHours(parseInt(frame[dayStart] as string), 0, 0, 0);
  
      const end = new Date(frame[date] as string);
      end.setHours(parseInt(frame[dayEnd] as string), 0, 0, 0);
  
      return await frames.query(Schedule._getSlots, { owner: user, start, end }, { slots });
    },
    then: actions([
      Planner.replan,
      { user, date, dayStart, dayEnd, existingSchedule: slots },
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
// This action is simpler and does not need to query the Schedule concept.

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
