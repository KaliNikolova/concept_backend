---
timestamp: 'Fri Nov 07 2025 09:57:40 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_095740.76727c1b.md]]'
content_id: 0c8a8fb68bff1631d3e2d527faf1a06a2076c1114b4a0869fc05437e4fd17a0a
---

# file: src/concepts/Requesting/passthrough.ts

```typescript
/**
 * PASSTHROUGH CONFIGURATION
 *
 * This file is the single source of truth for configuring passthrough routes.
 *
 * Passthrough routes are a way to directly expose concept actions as API endpoints
 * without needing to write any additional code. This is useful for simple, public-facing
 * actions and queries.
 *
 * - `inclusions`: A map of routes to justifications. Any route listed here will be
 *   directly exposed. This is typically used for public, read-only queries.
 *
 * - `exclusions`: An array of routes. Any route listed here will *not* be directly
 *   exposed. Instead, a `Requesting.request` action will be fired, allowing you
 *   to handle it with a synchronization. This is the standard for any action that
 *   modifies state or requires authentication/authorization.
 *
 * Any route not listed in either `inclusions` or `exclusions` will be flagged as an
 * "UNVERIFIED ROUTE" on server startup. All routes should be explicitly categorized.
 */

/**
 * Routes to be directly exposed as API endpoints.
 * Key: route path (e.g., "/api/Concept/action")
 * Value: a string justification for why it's safe to expose.
 */
export const inclusions = {
  // LikertSurvey: Public queries for viewing survey details are safe.
  "/api/LikertSurvey/_getSurveyQuestions": "Public query to get questions for a survey.",
  "/api/LikertSurvey/_getSurveyResponses": "Public query to see all responses for a survey.",
  "/api/LikertSurvey/_getRespondentAnswers": "Public query to get a specific user's answers.",

  // Focus: A user should be able to see their current task.
  "/api/Focus/getCurrentTask": "Public query for a user to get their current focus task.",

  // Planner: Querying for available time slots is a safe read operation.
  "/api/Planner/_getAvailableSlots": "Public query to find available time slots in a user's schedule.",

  // Schedule: A user needs to be able to view their scheduled slots.
  "/api/Schedule/_getSlots": "Public query for a user to retrieve their scheduled time slots.",

  // Tasks: A user needs to see their list of tasks.
  "/api/Tasks/_getTasks": "Public query for a user to get their list of tasks.",
  "/api/Tasks/_getRemainingTasks": "Public query for a user to get their incomplete tasks.",
};

/**
 * Routes to be excluded from direct passthrough.
 * These will fire a `Requesting.request` action instead, to be handled by syncs.
 */
export const exclusions = [
  // LikertSurvey: Submitting data should be a request.
  "/api/LikertSurvey/submitResponse",
  "/api/LikertSurvey/updateResponse",

  // Focus: Modifying a user's focus should be a controlled action.
  "/api/Focus/setCurrentTask",
  "/api/Focus/clearCurrentTask",

  // Planner: All planning and data modification actions require business logic.
  "/api/Planner/planDay",
  "/api/Planner/replan",
  "/api/Planner/clearDay",
  "/api/Planner/deleteAllForUser",
  "/api/Planner/getNextTask",
  "/api/Planner/_getScheduledTasks", // Excluded as it might contain sensitive info; should be authorized.
  "/api/Planner/_scheduleTasks", // This sounds like a write action, so exclude.

  // Schedule: All modifications to a user's schedule must be controlled.
  "/api/Schedule/blockTime",
  "/api/Schedule/updateSlot",
  "/api/Schedule/deleteSlot",
  "/api/Schedule/syncCalendar",
  "/api/Schedule/deleteAllForUser",

  // Sessioning: Session management is critical for security and must be handled by syncs.
  "/api/Sessioning/create",
  "/api/Sessioning/delete",
  "/api/Sessioning/_getUser", // Sensitive query that exposes user ID from session token.

  // Tasks: All task modifications must be controlled actions.
  "/api/Tasks/createUserTasks",
  "/api/Tasks/createTask",
  "/api/Tasks/updateTask",
  "/api/Tasks/reorderTasks",
  "/api/Tasks/markTaskComplete",
  "/api/Tasks/deleteTask",
  "/api/Tasks/deleteAllForUser",

  // UserAccount: All account actions are highly sensitive and must be handled by syncs.
  "/api/UserAccount/register",
  "/api/UserAccount/login",
  "/api/UserAccount/updateProfile",
  "/api/UserAccount/deleteAccount",
  "/api/UserAccount/_getUserProfile", // Sensitive query, should require authentication.
  "/api/UserAccount/_findUserByEmail", // Sensitive query, should be restricted.
];
```
