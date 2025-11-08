---
timestamp: 'Fri Nov 07 2025 10:30:59 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_103059.18289521.md]]'
content_id: aa8c71e21d3c901f9972ceb1caf23bd7fc713c19e5f8cf64ded475027e1b3d04
---

# file: src/syncs/schedule.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, Schedule } from "@concepts";

/**
 * =============================================================================
 * GET SLOTS
 * Handles POST /api/Schedule/_getSlots
 * =============================================================================
 */
export const GetSlotsRequest: Sync = ({ request, session, user, startTime, endTime }) => ({
  when: actions([
    Requesting.request,
    { path: "/Schedule/_getSlots", session, startTime, endTime },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Schedule._getSlots, { user, startTime, endTime }]),
});

export const GetSlotsResponse: Sync = ({ request, slots }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/_getSlots" }, { request }],
    [Schedule._getSlots, {}, { slots }],
  ),
  then: actions([Requesting.respond, { request, slots }]),
});

export const GetSlotsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/_getSlots" }, { request }],
    [Schedule._getSlots, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * BLOCK TIME
 * Handles POST /api/Schedule/blockTime
 * =============================================================================
 */
export const BlockTimeRequest: Sync = ({ request, session, user, startTime, endTime, title }) => ({
  when: actions([
    Requesting.request,
    { path: "/Schedule/blockTime", session, startTime, endTime, title },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Schedule.blockTime, { user, startTime, endTime, title }]),
});

export const BlockTimeResponse: Sync = ({ request, slot }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/blockTime" }, { request }],
    [Schedule.blockTime, {}, { slot }],
  ),
  then: actions([Requesting.respond, { request, slot }]),
});

export const BlockTimeResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/blockTime" }, { request }],
    [Schedule.blockTime, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * UPDATE SLOT
 * Handles POST /api/Schedule/updateSlot
 * =============================================================================
 */
export const UpdateSlotRequest: Sync = ({ request, session, user, slot, startTime, endTime, title }) => ({
  when: actions([
    Requesting.request,
    { path: "/Schedule/updateSlot", session, slot, startTime, endTime, title },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Schedule.updateSlot, { user, slot, startTime, endTime, title }]),
});

export const UpdateSlotResponse: Sync = ({ request, slot }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/updateSlot" }, { request }],
    [Schedule.updateSlot, {}, { slot }],
  ),
  then: actions([Requesting.respond, { request, slot }]),
});

export const UpdateSlotResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/updateSlot" }, { request }],
    [Schedule.updateSlot, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * DELETE SLOT
 * Handles POST /api/Schedule/deleteSlot
 * =============================================================================
 */
export const DeleteSlotRequest: Sync = ({ request, session, user, slot }) => ({
  when: actions([
    Requesting.request,
    { path: "/Schedule/deleteSlot", session, slot },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Schedule.deleteSlot, { user, slot }]),
});

export const DeleteSlotResponse: Sync = ({ request, slot }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/deleteSlot" }, { request }],
    [Schedule.deleteSlot, {}, { slot }],
  ),
  then: actions([Requesting.respond, { request, slot }]),
});

export const DeleteSlotResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/deleteSlot" }, { request }],
    [Schedule.deleteSlot, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * SYNC CALENDAR
 * Handles POST /api/Schedule/syncCalendar
 * =============================================================================
 */
export const SyncCalendarRequest: Sync = ({ request, session, user }) => ({
  when: actions([Requesting.request, { path: "/Schedule/syncCalendar", session }, { request }]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Schedule.syncCalendar, { user }]),
});

export const SyncCalendarResponse: Sync = ({ request, status }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/syncCalendar" }, { request }],
    [Schedule.syncCalendar, {}, { status }],
  ),
  then: actions([Requesting.respond, { request, status }]),
});

export const SyncCalendarResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/syncCalendar" }, { request }],
    [Schedule.syncCalendar, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
