---
timestamp: 'Fri Nov 07 2025 09:57:06 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_095706.e66852c8.md]]'
content_id: c5f1e8d109588c103be2892f647f3030c2944bc8377df83b14062b85b625c48e
---

# prompt:

Requesting concept initialized with a timeout of 10000ms.

Registering concept passthrough routes.
WARNING - UNVERIFIED ROUTE: /api/Focus/setCurrentTask
WARNING - UNVERIFIED ROUTE: /api/Focus/clearCurrentTask
WARNING - UNVERIFIED ROUTE: /api/Focus/getCurrentTask
-> /api/LikertSurvey/submitResponse
-> /api/LikertSurvey/updateResponse
-> /api/LikertSurvey/\_getSurveyQuestions
-> /api/LikertSurvey/\_getSurveyResponses
-> /api/LikertSurvey/\_getRespondentAnswers
WARNING - UNVERIFIED ROUTE: /api/Planner/planDay
WARNING - UNVERIFIED ROUTE: /api/Planner/replan
WARNING - UNVERIFIED ROUTE: /api/Planner/clearDay
WARNING - UNVERIFIED ROUTE: /api/Planner/deleteAllForUser
WARNING - UNVERIFIED ROUTE: /api/Planner/getNextTask
WARNING - UNVERIFIED ROUTE: /api/Planner/\_getScheduledTasks
WARNING - UNVERIFIED ROUTE: /api/Planner/\_scheduleTasks
WARNING - UNVERIFIED ROUTE: /api/Planner/\_getAvailableSlots
WARNING - UNVERIFIED ROUTE: /api/Schedule/blockTime
WARNING - UNVERIFIED ROUTE: /api/Schedule/updateSlot
WARNING - UNVERIFIED ROUTE: /api/Schedule/deleteSlot
WARNING - UNVERIFIED ROUTE: /api/Schedule/syncCalendar
WARNING - UNVERIFIED ROUTE: /api/Schedule/deleteAllForUser
WARNING - UNVERIFIED ROUTE: /api/Schedule/\_getSlots
WARNING - UNVERIFIED ROUTE: /api/Sessioning/create
WARNING - UNVERIFIED ROUTE: /api/Sessioning/delete
WARNING - UNVERIFIED ROUTE: /api/Sessioning/\_getUser
WARNING - UNVERIFIED ROUTE: /api/Tasks/createUserTasks
WARNING - UNVERIFIED ROUTE: /api/Tasks/createTask
WARNING - UNVERIFIED ROUTE: /api/Tasks/updateTask
WARNING - UNVERIFIED ROUTE: /api/Tasks/reorderTasks
WARNING - UNVERIFIED ROUTE: /api/Tasks/markTaskComplete
WARNING - UNVERIFIED ROUTE: /api/Tasks/deleteTask
WARNING - UNVERIFIED ROUTE: /api/Tasks/deleteAllForUser
WARNING - UNVERIFIED ROUTE: /api/Tasks/\_getTasks
WARNING - UNVERIFIED ROUTE: /api/Tasks/\_getRemainingTasks
WARNING - UNVERIFIED ROUTE: /api/UserAccount/register
WARNING - UNVERIFIED ROUTE: /api/UserAccount/login
WARNING - UNVERIFIED ROUTE: /api/UserAccount/updateProfile
WARNING - UNVERIFIED ROUTE: /api/UserAccount/deleteAccount
WARNING - UNVERIFIED ROUTE: /api/UserAccount/\_getUserProfile
WARNING - UNVERIFIED ROUTE: /api/UserAccount/\_findUserByEmail
FIX: Please verify routes in: ./src/concepts/Requesting/passthrough.ts

**Decide which actions to include and exclude**. After updating your repo, run the build command (`deno run build`) and then the command to start up the request server (`deno run start`). It will print to the console a list of “unverified” routes. These are the routes corresponding to the actions of your concepts. Now decide which of these should be included (that is, passed through directly) and which should be excluded (that is, turned into request actions for syncing). Specify these inclusions and exclusions in the code by updating the provided file that defines them, and restart your server to check that all routes are now appropriately listed. Now check that your front end continues to work with the updated back end; as it executes, you should see a trace of the incoming actions appearing in the console.
