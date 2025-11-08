---
timestamp: 'Fri Nov 07 2025 10:05:05 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_100505.53524a7a.md]]'
content_id: a7caa11dbac627efd7371a2daba637df630a4c80e1cacae71b02a2ee80ef9186
---

# prompt:

```
Requesting concept initialized with a timeout of 10000ms.

Registering concept passthrough routes.
WARNING - UNVERIFIED ROUTE: /api/Focus/setCurrentTask
WARNING - UNVERIFIED ROUTE: /api/Focus/clearCurrentTask
WARNING - UNVERIFIED ROUTE: /api/Focus/getCurrentTask
  -> /api/LikertSurvey/submitResponse
  -> /api/LikertSurvey/updateResponse
  -> /api/LikertSurvey/_getSurveyQuestions
  -> /api/LikertSurvey/_getSurveyResponses
  -> /api/LikertSurvey/_getRespondentAnswers
WARNING - UNVERIFIED ROUTE: /api/Planner/planDay
WARNING - UNVERIFIED ROUTE: /api/Planner/replan
WARNING - UNVERIFIED ROUTE: /api/Planner/clearDay
WARNING - UNVERIFIED ROUTE: /api/Planner/deleteAllForUser
WARNING - UNVERIFIED ROUTE: /api/Planner/getNextTask
WARNING - UNVERIFIED ROUTE: /api/Planner/_getScheduledTasks
WARNING - UNVERIFIED ROUTE: /api/Planner/_scheduleTasks
WARNING - UNVERIFIED ROUTE: /api/Planner/_getAvailableSlots
WARNING - UNVERIFIED ROUTE: /api/Schedule/blockTime
WARNING - UNVERIFIED ROUTE: /api/Schedule/updateSlot
WARNING - UNVERIFIED ROUTE: /api/Schedule/deleteSlot
WARNING - UNVERIFIED ROUTE: /api/Schedule/syncCalendar
WARNING - UNVERIFIED ROUTE: /api/Schedule/deleteAllForUser
WARNING - UNVERIFIED ROUTE: /api/Schedule/_getSlots
WARNING - UNVERIFIED ROUTE: /api/Sessioning/create
WARNING - UNVERIFIED ROUTE: /api/Sessioning/delete
WARNING - UNVERIFIED ROUTE: /api/Sessioning/_getUser
WARNING - UNVERIFIED ROUTE: /api/Tasks/createUserTasks
WARNING - UNVERIFIED ROUTE: /api/Tasks/createTask
WARNING - UNVERIFIED ROUTE: /api/Tasks/updateTask
WARNING - UNVERIFIED ROUTE: /api/Tasks/reorderTasks
WARNING - UNVERIFIED ROUTE: /api/Tasks/markTaskComplete
WARNING - UNVERIFIED ROUTE: /api/Tasks/deleteTask
WARNING - UNVERIFIED ROUTE: /api/Tasks/deleteAllForUser
WARNING - UNVERIFIED ROUTE: /api/Tasks/_getTasks
WARNING - UNVERIFIED ROUTE: /api/Tasks/_getRemainingTasks
WARNING - UNVERIFIED ROUTE: /api/UserAccount/register
WARNING - UNVERIFIED ROUTE: /api/UserAccount/login
WARNING - UNVERIFIED ROUTE: /api/UserAccount/updateProfile
WARNING - UNVERIFIED ROUTE: /api/UserAccount/deleteAccount
WARNING - UNVERIFIED ROUTE: /api/UserAccount/_getUserProfile
WARNING - UNVERIFIED ROUTE: /api/UserAccount/_findUserByEmail
FIX: Please verify routes in: ./src/concepts/Requesting/passthrough.ts
```

**Decide which actions to include and exclude**. After updating your repo, run the build command (`deno run build`) and then the command to start up the request server (`deno run start`). It will print to the console a list of “unverified” routes. These are the routes corresponding to the actions of your concepts. Now decide which of these should be included (that is, passed through directly) and which should be excluded (that is, turned into request actions for syncing). Specify these inclusions and exclusions in the code by updating the provided file that defines them, and restart your server to check that all routes are now appropriately listed. Now check that your front end continues to work with the updated back end; as it executes, you should see a trace of the incoming actions appearing in the console.

Here is an example from another app ConceptBox, which is a backend for a cloud file storage service akin to a mini-Dropbox

```
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
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
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
  // Feel free to delete these example inclusions
  "/api/LikertSurvey/_getSurveyQuestions": "this is a public query",
  "/api/LikertSurvey/_getSurveyResponses": "responses are public",
  "/api/LikertSurvey/_getRespondentAnswers": "answers are visible",
  "/api/LikertSurvey/submitResponse": "allow anyone to submit response",
  "/api/LikertSurvey/updateResponse": "allow anyone to update their response",
  
  // UserAuthentication
  "/api/UserAuthentication/_getUserByUsername": "okay to lookup users by their username",
  "/api/UserAuthentication/_getUsername": "reverse is maybe true too",

  // FileUploading
  "/api/FileUploading/_getFilename": "need to grab filenames for previews"
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
  // Feel free to delete these example exclusions
  "/api/LikertSurvey/createSurvey",
  "/api/LikertSurvey/addQuestion",

  // UserAuthentication
  "/api/UserAuthentication/register",
  "/api/UserAuthentication/login",

  // FileUploading
  "/api/FileUploading/requestUploadURL",
  "/api/FileUploading/confirmUpload",
  "/api/FileUploading/_getFilesByOwner",
  "/api/FileUploading/_getDownloadURL",
  "/api/FileUploading/_getOwner",
  "/api/FileUploading/delete",

  // Sessioning
  "/api/Sessioning/create",
  "/api/Sessioning/delete",
  "/api/Sessioning/_getUser",

  // Sharing
  "/api/Sharing/shareWithUser",
  "/api/Sharing/revokeAccess",
  "/api/Sharing/_isSharedWith",
  "/api/Sharing/_getFilesSharedWithUser",
];
```
