---
timestamp: 'Fri Nov 07 2025 10:19:10 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_101910.2a3f480d.md]]'
content_id: 82c1d4e1ef3a7339f140b3ea42b0e46380e2dee232773f09b2a06e4dc492d363
---

# file: src/syncs/tasks.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, Tasks } from "@concepts";

/**
 * =============================================================================
 * CREATE TASK
 * Handles POST /api/Tasks/createTask
 * =============================================================================
 */
export const CreateTaskRequest: Sync = ({ request, session, user, title, description, dueDate, estimatedTime }) => ({
  when: actions([
    Requesting.request,
    // Note: description, dueDate, and estimatedTime are optional parameters
    { path: "/Tasks/createTask", session, title, description, dueDate, estimatedTime },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.createTask, { owner: user, title, description, dueDate, estimatedTime }]),
});

export const CreateTaskResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/createTask" }, { request }],
    [Tasks.createTask, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

export const CreateTaskResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/createTask" }, { request }],
    [Tasks.createTask, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * GET TASKS
 * Handles POST /api/Tasks/_getTasks
 * =============================================================================
 */
export const GetTasksRequest: Sync = ({ request, session, user }) => ({
  when: actions([Requesting.request, { path: "/Tasks/_getTasks", session }, { request }]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks._getTasks, { user }]),
});

export const GetTasksResponse: Sync = ({ request, tasks }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/_getTasks" }, { request }],
    [Tasks._getTasks, {}, { tasks }],
  ),
  then: actions([Requesting.respond, { request, tasks }]),
});

export const GetTasksResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/_getTasks" }, { request }],
    [Tasks._getTasks, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * UPDATE TASK
 * Handles POST /api/Tasks/updateTask
 * =============================================================================
 */
export const UpdateTaskRequest: Sync = ({ request, session, user, task, title, description, dueDate, estimatedTime, completed, order }) => ({
  when: actions([
    Requesting.request,
    { path: "/Tasks/updateTask", session, task, title, description, dueDate, estimatedTime, completed, order },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  // Pass the user to the concept action for ownership verification
  then: actions([Tasks.updateTask, { task, user, title, description, dueDate, estimatedTime, completed, order }]),
});

export const UpdateTaskResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/updateTask" }, { request }],
    [Tasks.updateTask, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

export const UpdateTaskResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/updateTask" }, { request }],
    [Tasks.updateTask, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * REORDER TASKS
 * Handles POST /api/Tasks/reorderTasks
 * =============================================================================
 */
export const ReorderTasksRequest: Sync = ({ request, session, user, orderedTasks }) => ({
  when: actions([Requesting.request, { path: "/Tasks/reorderTasks", session, orderedTasks }, { request }]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.reorderTasks, { user, orderedTasks }]),
});

export const ReorderTasksResponse: Sync = ({ request, tasks }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/reorderTasks" }, { request }],
    [Tasks.reorderTasks, {}, { tasks }],
  ),
  then: actions([Requesting.respond, { request, tasks }]),
});

export const ReorderTasksResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/reorderTasks" }, { request }],
    [Tasks.reorderTasks, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * MARK TASK COMPLETE
 * Handles POST /api/Tasks/markTaskComplete
 * =============================================================================
 */
export const MarkTaskCompleteRequest: Sync = ({ request, session, user, task }) => ({
  when: actions([Requesting.request, { path: "/Tasks/markTaskComplete", session, task }, { request }]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.markTaskComplete, { task, user }]),
});

export const MarkTaskCompleteResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/markTaskComplete" }, { request }],
    [Tasks.markTaskComplete, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

export const MarkTaskCompleteResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/markTaskComplete" }, { request }],
    [Tasks.markTaskComplete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * DELETE TASK
 * Handles POST /api/Tasks/deleteTask
 * =============================================================================
 */
export const DeleteTaskRequest: Sync = ({ request, session, user, task }) => ({
  when: actions([Requesting.request, { path: "/Tasks/deleteTask", session, task }, { request }]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.deleteTask, { task, user }]),
});

export const DeleteTaskResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/deleteTask" }, { request }],
    [Tasks.deleteTask, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

export const DeleteTaskResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/deleteTask" }, { request }],
    [Tasks.deleteTask, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
