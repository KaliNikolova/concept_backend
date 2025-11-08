import { actions, Sync } from "@engine";
import { Focus, Requesting, Sessioning } from "@concepts";

/**
 * =============================================================================
 * QUERIES - Reading Focus Data
 * =============================================================================
 */

/**
 * @sync GetCurrentTask
 * @when a request is made to get the user's current focus task
 * @where the session is valid
 * @then the user's current task is returned (or empty if none set)
 */
export const GetCurrentTask: Sync = ({ request, session, user, task }) => ({
  when: actions([
    Requesting.request,
    { path: "/Focus/_getCurrentTask", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames; // Unauthorized
    return await frames.query(Focus._getCurrentTask, { user }, { task });
  },
  then: actions([Requesting.respond, { request, task }]),
});

/**
 * =============================================================================
 * ACTIONS - Modifying Focus Data
 * Each action uses a request/response pattern (no errors expected).
 * =============================================================================
 */

// --- SET CURRENT TASK ---

export const SetCurrentTaskRequest: Sync = (
  { request, session, user, task },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Focus/setCurrentTask", session, task },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Focus.setCurrentTask, { user, task }]),
});

export const SetCurrentTaskResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Focus/setCurrentTask" }, { request }],
    [Focus.setCurrentTask, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

// --- CLEAR CURRENT TASK ---

export const ClearCurrentTaskRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Focus/clearCurrentTask", session },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Focus.clearCurrentTask, { user }]),
});

export const ClearCurrentTaskResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Focus/clearCurrentTask" }, { request }],
    [Focus.clearCurrentTask, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

