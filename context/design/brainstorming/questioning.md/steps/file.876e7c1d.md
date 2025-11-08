---
timestamp: 'Fri Nov 07 2025 10:05:43 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_100543.0c40753d.md]]'
content_id: 876e7c1db043e3c07358d62d75bdf8735adbf6dcd87fa3e06c76ddcb15db0a1f
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
 * An empty inclusions list is perfectly acceptable and often safer.
 *
 * inclusions = {"route": "justification"}
 */
export const inclusions: Record<string, string> = {
  // There are no routes that should be publicly accessible without
  // some form of mediation (like authentication or authorization checks),
  // so we will not include any passthrough routes by default.
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. This allows
 * synchronizations to handle authentication, authorization, and
 * multi-concept workflows.
 *
 * exclusions = ["route"]
 */
export const exclusions: Array<string> = [
  // UserAccount: Registration and login require coordination with the Sessioning
  // concept, so they must be handled by a synchronization.
  "/api/UserAccount/register",
  "/api/UserAccount/login",

  // All other actions below require an active session to authorize the request,
  // which is handled by synchronizations.
  "/api/Focus/setCurrentTask",
  "/api/Focus/clearCurrentTask",
  "/api/Focus/getCurrentTask",

  "/api/Planner/planDay",
  "/api/Planner/replan",
  "/api/Planner/clearDay",
  "/api/Planner/deleteAllForUser",
  "/api/Planner/getNextTask",
  "/api/Planner/_getScheduledTasks",
  "/api/Planner/_scheduleTasks",
  "/api/Planner/_getAvailableSlots",

  "/api/Schedule/blockTime",
  "/api/Schedule/updateSlot",
  "/api/Schedule/deleteSlot",
  "/api/Schedule/syncCalendar",
  "/api/Schedule/deleteAllForUser",
  "/api/Schedule/_getSlots",

  "/api/Sessioning/create",
  "/api/Sessioning/delete",
  "/api/Sessioning/_getUser",

  "/api/Tasks/createUserTasks",
  "/api/Tasks/createTask",
  "/api/Tasks/updateTask",
  "/api/Tasks/reorderTasks",
  "/api/Tasks/markTaskComplete",
  "/api/Tasks/deleteTask",
  "/api/Tasks/deleteAllForUser",
  "/api/Tasks/_getTasks",
  "/api/Tasks/_getRemainingTasks",

  "/api/UserAccount/updateProfile",
  "/api/UserAccount/deleteAccount",
  "/api/UserAccount/_getUserProfile",
  "/api/UserAccount/_findUserByEmail",
];
```
