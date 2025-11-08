---
timestamp: 'Fri Nov 07 2025 03:26:19 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_032619.feccaafd.md]]'
content_id: 2dd2b4f25b4aa683f51932f5eb65aeedc878ffffe062d2b0040024d80e928ad1
---

# file: src/concepts/Requesting/passthrough.ts

```typescript
/**
 * This file configures the passthrough routes for the Requesting concept.
 *
 * A passthrough route allows an HTTP request to directly trigger a concept action
 * without being reified into a `Requesting.request` action. This is useful for
 * public-facing, simple actions that don't require complex synchronization logic
 * like authentication or multi-concept coordination.
 *
 * `inclusions`: A dictionary of routes to be treated as passthrough. The key is the
 * route path (without the base URL), and the value is a string justification for
 * why it is safe to be a passthrough.
 *
 * `exclusions`: An array of route paths to be explicitly excluded from passthrough.
 * These routes will trigger a `Requesting.request` action, allowing syncs to
 * handle them. Any route not listed in `inclusions` or `exclusions` will also default
 * to being excluded and will generate a warning on startup. It is best practice
 * to explicitly list all routes in one of these two configurations.
 */

export const inclusions: Record<string, string> = {
  // LikertSurvey routes are kept as public for anonymous survey participation.
  "/api/LikertSurvey/submitResponse": "Public action to submit a new survey response.",
  "/api/LikertSurvey/updateResponse": "Public action to update an existing survey response.",
  "/api/LikertSurvey/_getSurveyQuestions": "Public query to retrieve questions for a survey.",
  "/api/LikertSurvey/_getSurveyResponses": "Public query to see aggregate survey responses.",
  "/api/LikertSurvey/_getRespondentAnswers": "Public query for a respondent to see their own answers.",

  // UserAccount register and login must be public for users to sign up and sign in.
  "/api/UserAccount/register": "Public endpoint for new user registration.",
  "/api/UserAccount/login": "Public endpoint for user authentication.",
};

export const exclusions: string[] = [
  // Focus concept actions are user-specific and require authentication.
  "/api/Focus/setCurrentTask",
  "/api/Focus/clearCurrentTask",
  "/api/Focus/getCurrentTask",

  // Planner concept actions manage a user's personal schedule.
  "/api/Planner/planDay",
  "/api/Planner/replan",
  "/api/Planner/clearDay",
  "/api/Planner/deleteAllForUser",
  "/api/Planner/getNextTask",
  "/api/Planner/_getScheduledTasks",
  "/api/Planner/_scheduleTasks",
  "/api/Planner/_getAvailableSlots",

  // Schedule concept actions are user-specific.
  "/api/Schedule/blockTime",
  "/api/Schedule/updateSlot",
  "/api/Schedule/deleteSlot",
  "/api/Schedule/syncCalendar",
  "/api/Schedule/deleteAllForUser",
  "/api/Schedule/_getSlots",

  // Tasks are private to each user and require authentication for all operations.
  "/api/Tasks/createUserTasks",
  "/api/Tasks/createTask",
  "/api/Tasks/updateTask",
  "/api/Tasks/reorderTasks",
  "/api/Tasks/markTaskComplete",
  "/api/Tasks/deleteTask",
  "/api/Tasks/deleteAllForUser",
  "/api/Tasks/_getTasks",
  "/api/Tasks/_getRemainingTasks",

  // UserAccount actions beyond register/login are sensitive and must be authenticated.
  "/api/UserAccount/updateProfile",
  "/api/UserAccount/deleteAccount",
  "/api/UserAccount/_getUserProfile",
  "/api/UserAccount/_findUserByEmail",
];
```
