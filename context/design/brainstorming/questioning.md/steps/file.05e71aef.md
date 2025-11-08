---
timestamp: 'Fri Nov 07 2025 11:15:07 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_111507.08180628.md]]'
content_id: 05e71aef0af16af50a578fd5d9cfd47459720cd5af2abedaede4de2d007e306c
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

    // This now works because the concept query returns the correct array shape
    return await frames.query(Planner._getScheduledTasks, { owner: user, date }, { scheduledTasks });
  },
  then: actions([Requesting.respond, { request, scheduledTasks }]),
});

/**
 * =============================================================================
 * ACTIONS - Orchestrating and Modifying Planner Data
 * =============================================================================
 */

// --- PLAN DAY ---

export const PlanDayRequest: Sync = ({ request, session, user, date, dayStart, dayEnd, slots, tasks }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Planner/planDay", session, date, dayStart, dayEnd },
    { request },
  ]),
  where: async (frames) => {
    // 1. Authorize the request
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames;

    // 2. Orchestrate: Fetch data from other concepts that the Planner needs.
    const frame = frames[0];
    const startDate = new Date(`${frame[date] as string}T00:00:00.000Z`);
    const endDate = new Date(`${frame[date] as string}T23:59:59.999Z`);

    frames = await frames.query(Schedule._getSlots, { owner: user, start: startDate, end: endDate }, { slots });
    frames = await frames.query(Tasks._getRemainingTasks, { owner: user }, { tasks });
    
    return frames;
  },
  then: actions([
    // 3. Act: Call the Planner concept, providing all fetched data as context.
    Planner.planDay,
    { user, date, dayStart, dayEnd, existingSchedule: slots, tasksToSchedule: tasks },
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

export const ReplanRequest: Sync = ({ request, session, user, date, dayStart, dayEnd, slots, tasks }) => ({
    when: actions([
      Requesting.request,
      { path: "/api/Planner/replan", session, date, dayStart, dayEnd },
      { request },
    ]),
    where: async (frames) => {
      frames = await frames.query(Sessioning._getUser, { session }, { user });
      if (frames.length === 0) return frames;
  
      const frame = frames[0];
      const startDate = new Date(`${frame[date] as string}T00:00:00.000Z`);
      const endDate = new Date(`${frame[date] as string}T23:59:59.999Z`);
  
      frames = await frames.query(Schedule._getSlots, { owner: user, start: startDate, end: endDate }, { slots });
      frames = await frames.query(Tasks._getRemainingTasks, { owner: user }, { tasks });

      return frames;
    },
    then: actions([
      Planner.replan,
      { user, date, dayStart, dayEnd, existingSchedule: slots, tasksToSchedule: tasks },
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
