import { actions, Sync } from "@engine";
import { Focus, Planner, Requesting, Sessioning, Tasks } from "@concepts";

/**
 * =============================================================================
 * QUERIES - Reading Task Data
 * =============================================================================
 */

/**
 * @sync GetTasks
 * @when a request is made to get all of a user's tasks
 * @where the session is valid
 * @then the user's tasks are returned
 */
export const GetTasks: Sync = ({ request, session, user, tasks }) => ({
  when: actions([
    Requesting.request,
    { path: "/Tasks/_getTasks", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames; // Unauthorized
    return await frames.query(Tasks._getTasks, { user }, { tasks });
  },
  then: actions([Requesting.respond, { request, tasks }]),
});

/**
 * @sync GetRemainingTasks
 * @when a request is made to get a user's incomplete tasks
 * @where the session is valid
 * @then the user's remaining tasks are returned
 */
export const GetRemainingTasks: Sync = (
  { request, session, user, tasks },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Tasks/_getRemainingTasks", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames; // Unauthorized
    return await frames.query(Tasks._getRemainingTasks, { user }, { tasks });
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

export const CreateTaskRequest: Sync = (
  { request, session, user, title, description, dueDate, estimatedDuration },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/Tasks/createTask",
      session,
      title,
      description,
      dueDate,
      estimatedDuration,
    },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.createTask, {
    owner: user,
    title,
    description,
    dueDate,
    estimatedDuration,
  }]),
});

export const CreateTaskResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/createTask" }, { request }],
    [Tasks.createTask, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

export const CreateTaskError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/createTask" }, { request }],
    [Tasks.createTask, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- UPDATE TASK ---

export const UpdateTaskRequest: Sync = (
  {
    request,
    session,
    user,
    task,
    newTitle,
    newDescription,
    newDueDate,
    newEstimatedDuration,
  },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/Tasks/updateTask",
      session,
      task,
      newTitle,
      newDescription,
      newDueDate,
      newEstimatedDuration,
    },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.updateTask, {
    task,
    newTitle,
    newDescription,
    newDueDate,
    newEstimatedDuration,
  }]),
});

export const UpdateTaskResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/updateTask" }, { request }],
    [Tasks.updateTask, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

export const UpdateTaskError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/updateTask" }, { request }],
    [Tasks.updateTask, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- REORDER TASKS ---

export const ReorderTasksRequest: Sync = (
  { request, session, user, newOrder },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Tasks/reorderTasks", session, newOrder },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.reorderTasks, { user, newOrder }]),
});

export const ReorderTasksResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/reorderTasks" }, { request }],
    [Tasks.reorderTasks, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

export const ReorderTasksError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/reorderTasks" }, { request }],
    [Tasks.reorderTasks, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- MARK TASK COMPLETE ---

export const MarkTaskCompleteRequest: Sync = (
  { request, session, user, task },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Tasks/markTaskComplete", session, task },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.markTaskComplete, { task }]),
});

export const MarkTaskCompleteResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/markTaskComplete" }, { request }],
    [Tasks.markTaskComplete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

export const MarkTaskCompleteError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/markTaskComplete" }, { request }],
    [Tasks.markTaskComplete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * @sync MarkCompleteGetNextTask
 * @when a task is marked complete
 * @then get the next scheduled task from the planner
 */
export const MarkCompleteGetNextTask: Sync = (
  { user, task, nextTask },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/Tasks/markTaskComplete", session: user },
      {},
    ],
    [Tasks.markTaskComplete, { task }, {}],
  ),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session: user }, { user }),
  then: actions([Planner.getNextTask, { user, completedTask: task }]),
});

/**
 * @sync MarkCompleteSetNextFocus
 * @when we get the next task after marking one complete
 * @then set that next task as the current focus
 */
export const MarkCompleteSetNextFocus: Sync = ({ user, nextTask }) => ({
  when: actions(
    [Tasks.markTaskComplete, {}, {}],
    [Planner.getNextTask, { user }, { nextTask }],
  ),
  then: actions([Focus.setCurrentTask, { user, task: nextTask }]),
});

// --- DELETE TASK ---

export const DeleteTaskRequest: Sync = ({ request, session, user, task }) => ({
  when: actions([
    Requesting.request,
    { path: "/Tasks/deleteTask", session, task },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Tasks.deleteTask, { task }]),
});

export const DeleteTaskResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/deleteTask" }, { request }],
    [Tasks.deleteTask, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

export const DeleteTaskError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Tasks/deleteTask" }, { request }],
    [Tasks.deleteTask, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
