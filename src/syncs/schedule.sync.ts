import { actions, Sync } from "@engine";
import { Requesting, Schedule, Sessioning } from "@concepts";

/**
 * =============================================================================
 * QUERIES - Reading Schedule Data
 * =============================================================================
 */

/**
 * @sync GetSlots
 * @when a request is made to get all of a user's scheduled slots
 * @where the session is valid
 * @then the user's slots are returned.
 */
export const GetSlots: Sync = (
  { request, session, user, slots, start, end },
) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Schedule/_getSlots", session, start, end },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames; // Unauthorized
    return await frames.query(Schedule._getSlots, { owner: user, start, end }, {
      slots,
    });
  },
  then: actions([Requesting.respond, { request, slots }]),
});

/**
 * =============================================================================
 * ACTIONS - Modifying Schedule Data
 * Each action uses a request/response/error pattern.
 * =============================================================================
 */

// --- BLOCK TIME ---

export const BlockTimeRequest: Sync = (
  { request, session, user, startTime, endTime, title, taskId },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/api/Schedule/blockTime",
      session,
      startTime,
      endTime,
      title,
      taskId,
    },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Schedule.blockTime, {
    owner: user,
    startTime,
    endTime,
    title,
    taskId,
  }]),
});

export const BlockTimeResponse: Sync = ({ request, slot }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Schedule/blockTime" }, { request }],
    [Schedule.blockTime, {}, { slot }],
  ),
  then: actions([Requesting.respond, { request, slot }]),
});

export const BlockTimeError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Schedule/blockTime" }, { request }],
    [Schedule.blockTime, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- UPDATE SLOT ---

export const UpdateSlotRequest: Sync = (
  { request, session, user, slot, startTime, endTime, title },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/api/Schedule/updateSlot",
      session,
      slot,
      startTime,
      endTime,
      title,
    },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Schedule.updateSlot, {
    user,
    slot,
    startTime,
    endTime,
    title,
  }]),
});

export const UpdateSlotResponse: Sync = ({ request, slot }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Schedule/updateSlot" }, { request }],
    [Schedule.updateSlot, {}, { slot }],
  ),
  then: actions([Requesting.respond, { request, slot }]),
});

export const UpdateSlotError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Schedule/updateSlot" }, { request }],
    [Schedule.updateSlot, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- DELETE SLOT ---

export const DeleteSlotRequest: Sync = ({ request, session, user, slot }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Schedule/deleteSlot", session, slot },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Schedule.deleteSlot, { user, slot }]),
});

export const DeleteSlotResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Schedule/deleteSlot" }, { request }],
    [Schedule.deleteSlot, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

export const DeleteSlotError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Schedule/deleteSlot" }, { request }],
    [Schedule.deleteSlot, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- SYNC CALENDAR ---
// This is an example of an action that might trigger a more complex,
// potentially long-running background process. The response indicates
// that the process has started.

export const SyncCalendarRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Schedule/syncCalendar", session },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Schedule.syncCalendar, { user }]),
});

export const SyncCalendarResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Schedule/syncCalendar" }, { request }],
    [Schedule.syncCalendar, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "sync_started" }]),
});

export const SyncCalendarError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Schedule/syncCalendar" }, { request }],
    [Schedule.syncCalendar, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
