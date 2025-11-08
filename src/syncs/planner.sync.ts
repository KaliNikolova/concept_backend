import { actions, Sync } from "@engine";
import { Planner, Requesting, Sessioning } from "@concepts";

/**
 * =============================================================================
 * QUERIES - Reading Planner Data
 * =============================================================================
 */

/**
 * @sync GetScheduledTasks
 * @when a request is made to get a user's scheduled tasks
 * @where the session is valid
 * @then the user's scheduled tasks are returned
 */
export const GetScheduledTasks: Sync = ({ request, session, user, tasks }) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/_getScheduledTasks", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames; // Unauthorized
    return await frames.query(Planner._getScheduledTasks, { user }, { tasks });
  },
  then: actions([Requesting.respond, { request, tasks }]),
});

/**
 * =============================================================================
 * ACTIONS - Modifying Planner Data
 * Each action uses a request/response/error pattern.
 * =============================================================================
 */

// --- PLAN DAY ---

export const PlanDayRequest: Sync = (
  { request, session, user, tasks, busySlots },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/planDay", session, tasks, busySlots },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Planner.planDay, { user, tasks, busySlots }]),
});

export const PlanDayResponse: Sync = ({ request, firstTask }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/planDay" }, { request }],
    [Planner.planDay, {}, { firstTask }],
  ),
  then: actions([Requesting.respond, { request, firstTask }]),
});

export const PlanDayError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/planDay" }, { request }],
    [Planner.planDay, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- REPLAN ---

export const ReplanRequest: Sync = (
  { request, session, user, tasks, busySlots },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/replan", session, tasks, busySlots },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Planner.replan, { user, tasks, busySlots }]),
});

export const ReplanResponse: Sync = ({ request, firstTask }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/replan" }, { request }],
    [Planner.replan, {}, { firstTask }],
  ),
  then: actions([Requesting.respond, { request, firstTask }]),
});

export const ReplanError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/replan" }, { request }],
    [Planner.replan, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- CLEAR DAY ---

export const ClearDayRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/clearDay", session },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Planner.clearDay, { user }]),
});

export const ClearDayResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/clearDay" }, { request }],
    [Planner.clearDay, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

// --- GET NEXT TASK ---

export const GetNextTaskRequest: Sync = (
  { request, session, user, completedTask },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/getNextTask", session, completedTask },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Planner.getNextTask, { user, completedTask }]),
});

export const GetNextTaskResponse: Sync = ({ request, nextTask }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/getNextTask" }, { request }],
    [Planner.getNextTask, {}, { nextTask }],
  ),
  then: actions([Requesting.respond, { request, nextTask }]),
});

export const GetNextTaskError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/getNextTask" }, { request }],
    [Planner.getNextTask, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

