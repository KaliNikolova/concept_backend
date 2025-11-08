---
timestamp: 'Fri Nov 07 2025 10:26:01 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_102601.ab92514b.md]]'
content_id: 9382fba3551ea71accc4ef47d69b5b09ae6ce19d90edcd482162a4c325487270
---

# file: src/syncs/planner.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, Planner } from "@concepts";

/**
 * =============================================================================
 * PLAN DAY
 * Handles POST /api/Planner/planDay
 * =============================================================================
 */
export const PlanDayRequest: Sync = ({ request, session, user, date, tasks }) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/planDay", session, date, tasks },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Planner.planDay, { user, date, tasks }]),
});

export const PlanDayResponse: Sync = ({ request, scheduledTasks }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/planDay" }, { request }],
    [Planner.planDay, {}, { scheduledTasks }],
  ),
  then: actions([Requesting.respond, { request, scheduledTasks }]),
});

export const PlanDayResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/planDay" }, { request }],
    [Planner.planDay, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * REPLAN DAY
 * Handles POST /api/Planner/replan
 * =============================================================================
 */
export const ReplanRequest: Sync = ({ request, session, user, date }) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/replan", session, date },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Planner.replan, { user, date }]),
});

export const ReplanResponse: Sync = ({ request, scheduledTasks }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/replan" }, { request }],
    [Planner.replan, {}, { scheduledTasks }],
  ),
  then: actions([Requesting.respond, { request, scheduledTasks }]),
});

export const ReplanResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/replan" }, { request }],
    [Planner.replan, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * CLEAR DAY
 * Handles POST /api/Planner/clearDay
 * =============================================================================
 */
export const ClearDayRequest: Sync = ({ request, session, user, date }) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/clearDay", session, date },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Planner.clearDay, { user, date }]),
});

export const ClearDayResponse: Sync = ({ request, date }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/clearDay" }, { request }],
    [Planner.clearDay, {}, { date }],
  ),
  then: actions([Requesting.respond, { request, date }]),
});

export const ClearDayResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/clearDay" }, { request }],
    [Planner.clearDay, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * GET NEXT TASK
 * Handles POST /api/Planner/getNextTask
 * =============================================================================
 */
export const GetNextTaskRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/getNextTask", session },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Planner.getNextTask, { user }]),
});

export const GetNextTaskResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/getNextTask" }, { request }],
    [Planner.getNextTask, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

export const GetNextTaskResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/getNextTask" }, { request }],
    [Planner.getNextTask, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * GET SCHEDULED TASKS
 * Handles POST /api/Planner/_getScheduledTasks
 * =============================================================================
 */
export const GetScheduledTasksRequest: Sync = ({ request, session, user, date }) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/_getScheduledTasks", session, date },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Planner._getScheduledTasks, { user, date }]),
});

export const GetScheduledTasksResponse: Sync = ({ request, tasks }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/_getScheduledTasks" }, { request }],
    [Planner._getScheduledTasks, {}, { tasks }],
  ),
  then: actions([Requesting.respond, { request, tasks }]),
});

export const GetScheduledTasksResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/_getScheduledTasks" }, { request }],
    [Planner._getScheduledTasks, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
