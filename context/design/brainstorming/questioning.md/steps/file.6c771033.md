---
timestamp: 'Fri Nov 07 2025 10:08:57 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_100857.9a424d59.md]]'
content_id: 6c771033eadc650efd6b23cc6f6e799ae0e9328fdb14807b65012cbe84fb7751
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
 */
export const inclusions: Record<string, string> = {
  // UserAccount.register is a standalone, public action for new users to create an account.
  // This assumes a user flow where registration is followed by a redirect to a login page,
  // rather than an automatic login.
  "/api/UserAccount/register": "Public action for new users to sign up.",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. This allows
 * synchronizations to handle authentication, authorization, and
 * multi-concept workflows.
 */
export const exclusions: Array<string> = [
  // UserAccount.login MUST be excluded because it requires coordination
  // with the Sessioning concept to create a session token upon successful authentication.
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
