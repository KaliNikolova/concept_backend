---
timestamp: 'Fri Nov 07 2025 10:53:41 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_105341.bab08b4f.md]]'
content_id: 5bf713b2ab0ed6abf232cabab095ed4e065e022baad5a772940bc1778bba625d
---

# file: src/syncs/tasks.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, Tasks } from "@concepts";

/**
 * =============================================================================
 * QUERIES - Reading Task Data
 * =============================================================================
 */

/**
 * @sync GetTasks
 * @when a request is made to get all of a user's tasks
 * @where the session is valid
 * @then the user's tasks are returned.
 */
export const GetTasks: Sync = ({ request, session, user, tasks }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Tasks/_getTasks", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames; // Fails silently if unauthorized, request will time out.
    // This now works because _getTasks returns the correct array shape
    return await frames.query(Tasks._getTasks, { owner: user }, { tasks });
  },
  then: actions([Requesting.respond, { request, tasks }]),
});

/**
 * @sync GetRemainingTasks
 * @when a request is made to get a user's incomplete tasks
 * @where the session is valid
 * @then the user's remaining tasks are returned.
 */
export const GetRemainingTasks: Sync = ({ request, session, user, tasks }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Tasks/_getRemainingTasks", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames;
    // This now works because _getRemainingTasks returns the correct array shape
    return await frames.query(Tasks._getRemainingTasks, { owner: user }, { tasks });
  },
  then: actions([Requesting.respond, { request, tasks }]),
});

/**
 * =============================================================================
 * ACTIONS - Modifying Task Data
 * Each action uses a request/response/error pattern.
 * =============================================================================
 */

// --- CREATE TASK ---

export const CreateTaskRequest: Sync = ({ request, session, user, title, description, duration }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Tasks/createTask", session, title, description, duration },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.createTask, { owner: user, title, description, duration }]),
});

export const CreateTaskResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Tasks/createTask" }, { request }],
    [Tasks.createTask, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

export const CreateTaskError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Tasks/createTask" }, { request }],
    [Tasks.createTask, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- UPDATE TASK ---

export const UpdateTaskRequest: Sync = ({ request, session, user, task, title, description, duration }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Tasks/updateTask", session, task, title, description, duration },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.updateTask, { user, task, title, description, duration }]),
});

export const UpdateTaskResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Tasks/updateTask" }, { request }],
    [Tasks.updateTask, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

export const UpdateTaskError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Tasks/updateTask" }, { request }],
    [Tasks.updateTask, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- MARK TASK COMPLETE ---

export const MarkTaskCompleteRequest: Sync = ({ request, session, user, task, completed }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Tasks/markTaskComplete", session, task, completed },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.markTaskComplete, { user, task, completed }]),
});

export const MarkTaskCompleteResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Tasks/markTaskComplete" }, { request }],
    [Tasks.markTaskComplete, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

export const MarkTaskCompleteError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Tasks/markTaskComplete" }, { request }],
    [Tasks.markTaskComplete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- DELETE TASK ---

export const DeleteTaskRequest: Sync = ({ request, session, user, task }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Tasks/deleteTask", session, task },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.deleteTask, { user, task }]),
});

export const DeleteTaskResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Tasks/deleteTask" }, { request }],
    [Tasks.deleteTask, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

export const DeleteTaskError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Tasks/deleteTask" }, { request }],
    [Tasks.deleteTask, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- REORDER TASKS ---

export const ReorderTasksRequest: Sync = ({ request, session, user, orderedTasks }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Tasks/reorderTasks", session, orderedTasks },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.reorderTasks, { user, orderedTasks }]),
});

export const ReorderTasksResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Tasks/reorderTasks" }, { request }],
    [Tasks.reorderTasks, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

export const ReorderTasksError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Tasks/reorderTasks" }, { request }],
    [Tasks.reorderTasks, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
