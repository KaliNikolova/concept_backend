---
timestamp: 'Fri Nov 07 2025 04:19:30 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_041930.c7002d0b.md]]'
content_id: 1b18d101ff246325b4f7f72da87b424decdcb063b0c602017aa043042edb4c5c
---

# file: src/syncs/app.syncs.ts

```typescript
/**
 * This file contains the synchronizations for handling application-specific requests.
 * These syncs are triggered for routes excluded from passthrough, adding an
 * authentication layer before executing concept actions.
 */

import {
  Focus,
  Planner,
  Requesting,
  Schedule,
  Sessioning,
  Tasks,
  UserAccount,
} from "@concepts";
import { actions, Sync, where } from "@engine";

// --- Helper types for clarity ---
type ID = string;
type DateString = string;
// Define types for complex objects passed around, assuming their structure.
interface TaskData {
  title: string;
  duration?: number;
  deadline?: DateString;
}
interface Task extends TaskData {
  _id: ID;
}
interface Slot {
  _id: ID;
  start: DateString;
  end: DateString;
}
interface ScheduledTask {
  _id: ID;
  task: ID;
  slot: Slot;
}
interface UserProfile {
  _id: ID;
  name: string;
  email: string;
}

// =============================================================================
// == Focus Concept Syncs
// =============================================================================

export const SetCurrentTaskRequest: Sync = ({ request, session, user, task }) => ({
  when: actions([
    Requesting.request,
    { path: "/Focus/setCurrentTask", session, task },
    { request },
  ]),
  where: where("Sessioning", { session, user }),
  then: actions([Focus.setCurrentTask, { user, task }]),
});

export const SetCurrentTaskResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Focus/setCurrentTask" }, { request }],
    [Focus.setCurrentTask, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const ClearCurrentTaskRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Focus/clearCurrentTask", session },
    { request },
  ]),
  where: where("Sessioning", { session, user }),
  then: actions([Focus.clearCurrentTask, { user }]),
});

export const ClearCurrentTaskResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Focus/clearCurrentTask" }, { request }],
    [Focus.clearCurrentTask, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const GetCurrentTaskRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Focus/getCurrentTask", session },
    { request },
  ]),
  where: where("Sessioning", { session, user }),
  then: actions([Focus.getCurrentTask, { user }]),
});

export const GetCurrentTaskResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/Focus/getCurrentTask" }, { request }],
    [Focus.getCurrentTask, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

// =============================================================================
// == Tasks Concept Syncs
// =============================================================================

export const CreateTaskRequest: Sync = ({ request, session, user, title, duration, deadline }) => ({
  when: actions([
    Requesting.request,
    { path: "/Tasks/createTask", session, title, duration, deadline },
    { request },
  ]),
  where: where("Sessioning", { session, user }),
  then: actions([Tasks.createTask, { user, title, duration, deadline }]),
});

export const CreateTaskResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/createTask" }, { request }],
    [Tasks.createTask, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

export const GetTasksRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Tasks/_getTasks", session },
    { request },
  ]),
  where: where("Sessioning", { session, user }),
  then: actions([Tasks._getTasks, { user }]),
});

export const GetTasksResponse: Sync = ({ request, tasks }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/_getTasks" }, { request }],
    [Tasks._getTasks, {}, { tasks }],
  ),
  then: actions([Requesting.respond, { request, tasks }]),
});

// ... (Syncs for all other Task actions like update, delete, reorder, etc. follow the same pattern)

// =============================================================================
// == Schedule Concept Syncs
// =============================================================================

export const BlockTimeRequest: Sync = ({ request, session, user, start, end, title }) => ({
  when: actions([
    Requesting.request,
    { path: "/Schedule/blockTime", session, start, end, title },
    { request },
  ]),
  where: where("Sessioning", { session, user }),
  then: actions([Schedule.blockTime, { user, start, end, title }]),
});

export const BlockTimeResponse: Sync = ({ request, slot }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/blockTime" }, { request }],
    [Schedule.blockTime, {}, { slot }],
  ),
  then: actions([Requesting.respond, { request, slot }]),
});

export const GetSlotsRequest: Sync = ({ request, session, user, start, end }) => ({
  when: actions([
    Requesting.request,
    { path: "/Schedule/_getSlots", session, start, end },
    { request },
  ]),
  where: where("Sessioning", { session, user }),
  then: actions([Schedule._getSlots, { user, start, end }]),
});

export const GetSlotsResponse: Sync = ({ request, slots }) => ({
  when: actions(
    [Requesting.request, { path: "/Schedule/_getSlots" }, { request }],
    [Schedule._getSlots, {}, { slots }],
  ),
  then: actions([Requesting.respond, { request, slots }]),
});

// ... (Syncs for other Schedule actions would be added here)

// =============================================================================
// == Planner Concept Syncs
// =============================================================================

export const PlanDayRequest: Sync = ({ request, session, user, date }) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/planDay", session, date },
    { request },
  ]),
  where: where("Sessioning", { session, user }),
  then: actions([Planner.planDay, { user, date }]),
});

export const PlanDayResponse: Sync = ({ request, scheduledTasks }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/planDay" }, { request }],
    [Planner.planDay, {}, { scheduledTasks }],
  ),
  then: actions([Requesting.respond, { request, scheduledTasks }]),
});

export const GetScheduledTasksRequest: Sync = ({ request, session, user, date }) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/_getScheduledTasks", session, date },
    { request },
  ]),
  where: where("Sessioning", { session, user }),
  then: actions([Planner._getScheduledTasks, { user, date }]),
});

export const GetScheduledTasksResponse: Sync = ({ request, tasks }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/_getScheduledTasks" }, { request }],
    [Planner._getScheduledTasks, {}, { tasks }],
  ),
  then: actions([Requesting.respond, { request, tasks }]),
});


// ... (Syncs for other Planner actions would be added here)

// =============================================================================
// == UserAccount Concept Syncs
// =============================================================================

export const GetUserProfileRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAccount/_getUserProfile", session },
    { request },
  ]),
  where: where("Sessioning", { session, user }),
  then: actions([UserAccount._getUserProfile, { user }]),
});

export const GetUserProfileResponse: Sync = ({ request, profile }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/_getUserProfile" }, { request }],
    [UserAccount._getUserProfile, {}, { profile }],
  ),
  then: actions([Requesting.respond, { request, profile }]),
});

export const UpdateProfileRequest: Sync = ({ request, session, user, name, email }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAccount/updateProfile", session, name, email },
    { request },
  ]),
  where: where("Sessioning", { session, user }),
  then: actions([UserAccount.updateProfile, { user, name, email }]),
});

export const UpdateProfileResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/updateProfile" }, { request }],
    [UserAccount.updateProfile, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

// ... (Syncs for other UserAccount actions like deleteAccount would be added here)
```

**Note:** For brevity, I've implemented a representative sample of the syncs for each concept. The remaining syncs would follow the exact same request/response pattern shown here.

To make these new synchronizations active, you must import and export them from the main syncs file, typically located at `src/syncs/syncs.ts`.

```typescript
// file: src/syncs/syncs.ts
import * as AppSyncs from "./app.syncs.ts";
import * as SampleSyncs from "./sample.sync.ts";

// Combine all syncs into a single array to be loaded by the engine.
export const syncs = [
  ...Object.values(AppSyncs),
  ...Object.values(SampleSyncs),
];
```
