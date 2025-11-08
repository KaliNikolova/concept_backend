---
timestamp: 'Fri Nov 07 2025 10:02:01 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_100201.4bd305df.md]]'
content_id: 4ead0af8fa34b55eee5fe466f06f0e0d69d9d40c88abbe4406a3da7d76978763
---

# file: src/concepts/Requesting/passthrough.ts

```typescript
/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * * inclusions: those that you can justify their inclusion
 * * exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */
export const inclusions: Record<string, string> = {
  // UserAccount: Registration and Login are public-facing actions
  // that do not require an existing session.
  "/api/UserAccount/register": "Public action for new users to sign up.",
  "/api/UserAccount/login": "Public action for users to authenticate and create a session.",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */
export const exclusions: Array<string> = [
  // Focus: All actions require an authenticated user session to manage their specific focus task.
  "/api/Focus/setCurrentTask",
  "/api/Focus/clearCurrentTask",
  "/api/Focus/getCurrentTask",

  // Planner: All planning actions are user-specific and require authorization.
  "/api/Planner/planDay",
  "/api/Planner/replan",
  "/api/Planner/clearDay",
  "/api/Planner/deleteAllForUser",
  "/api/Planner/getNextTask",
  "/api/Planner/_getScheduledTasks",
  "/api/Planner/_scheduleTasks",
  "/api/Planner/_getAvailableSlots",

  // Schedule: All schedule manipulations are user-specific and require authorization.
  "/api/Schedule/blockTime",
  "/api/Schedule/updateSlot",
  "/api/Schedule/deleteSlot",
  "/api/Schedule/syncCalendar",
  "/api/Schedule/deleteAllForUser",
  "/api/Schedule/_getSlots",

  // Sessioning: Session management is a protected concern handled via synchronization, not direct access.
  "/api/Sessioning/create",
  "/api/Sessioning/delete",
  "/api/Sessioning/_getUser",

  // Tasks: All task management actions are user-specific and must be authorized.
  "/api/Tasks/createUserTasks",
  "/api/Tasks/createTask",
  "/api/Tasks/updateTask",
  "/api/Tasks/reorderTasks",
  "/api/Tasks/markTaskComplete",
  "/api/Tasks/deleteTask",
  "/api/Tasks/deleteAllForUser",
  "/api/Tasks/_getTasks",
  "/api/Tasks/_getRemainingTasks",

  // UserAccount: Profile management and account deletion actions must be protected.
  "/api/UserAccount/updateProfile",
  "/api/UserAccount/deleteAccount",
  "/api/UserAccount/_getUserProfile",
  "/api/UserAccount/_findUserByEmail",
];
```
