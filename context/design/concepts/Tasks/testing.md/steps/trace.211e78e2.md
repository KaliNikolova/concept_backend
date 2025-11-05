---
timestamp: 'Mon Nov 03 2025 17:46:05 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251103_174605.6401f700.md]]'
content_id: 211e78e22177d690662f49ae930c1f2637554e29a8323381b43bec62eca87d21
---

# trace:

The operational principle for the `Tasks` concept is that "tasks are added to a prioritized list and can be marked as complete". The following trace demonstrates this principle in action.

1. A user, Alice, first needs a place to store her tasks. She calls `createUserTasks` to initialize her list.
   * **Action**: `createUserTasks({ user: "user:Alice" })`
   * **Result**: `{}` (Success)

2. Alice then adds three tasks to her list, each with a title. The concept creates each task with a 'TODO' status and adds them to her `orderedTasks` list in the order they were created.
   * **Action**: `createTask({ owner: "user:Alice", title: "Buy milk" })`
   * **Result**: `{ task: "..." }` (a unique task ID is generated)
   * **Action**: `createTask({ owner: "user:Alice", title: "Walk the dog" })`
   * **Result**: `{ task: "..." }`
   * **Action**: `createTask({ owner: "user:Alice", title: "File taxes" })`
   * **Result**: `{ task: "..." }`

3. We can query Alice's tasks to see that they are all there, in the correct order, and are all marked as 'TODO'.
   * **Query**: `_getTasks({ user: "user:Alice" })`
   * **Result**: A list of 3 task documents, in the order they were created, all with `status: "TODO"`. The first task's title is "Buy milk".

4. Alice finishes buying milk and marks the task as complete.
   * **Action**: `markTaskComplete({ task: "<ID of 'Buy milk' task>" })`
   * **Result**: `{}` (Success)

5. When we query her tasks again, we see the status has been updated.
   * **Query**: `_getTasks({ user: "user:Alice" })`
   * **Result**: A list of 3 task documents. The 'Buy milk' task now has `status: "DONE"`.

6. Finally, to see what she still needs to do, Alice can query for her remaining tasks. This query filters out the completed tasks.
   * **Query**: `_getRemainingTasks({ user: "user:Alice" })`
   * **Result**: A list containing only the 'Walk the dog' and 'File taxes' tasks.

This sequence demonstrates the core functionality outlined in the principle: creating a list, adding tasks which are implicitly prioritized by creation order, and marking them as complete to track progress.
