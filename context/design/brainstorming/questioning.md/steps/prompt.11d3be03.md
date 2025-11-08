---
timestamp: 'Fri Nov 07 2025 03:25:43 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_032543.de0cf37e.md]]'
content_id: 11d3be03ea3b957625900007aed0e3e56f99ecabd793978f944ead01018eaa9e
---

# prompt:

PS C:\Users\kalin\OneDrive - Massachusetts Institute of Technology\Uni\Senior\6104\concept\_backend> deno run start\
Task start deno run --allow-net --allow-write --allow-read --allow-sys --allow-env src/main.ts

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

🚀 Requesting server listening for POST requests at base path of /api/\*
Listening on http://localhost:8000/ (http://localhost:8000/)

**Decide which actions to include and exclude**. After updating your repo, run the build command (`deno run build`) and then the command to start up the request server (`deno run start`). It will print to the console a list of “unverified” routes. These are the routes corresponding to the actions of your concepts. Now decide which of these should be included (that is, passed through directly) and which should be excluded (that is, turned into request actions for syncing). Specify these inclusions and exclusions in the code by updating the provided file that defines them, and restart your server to check that all routes are now appropriately listed. Now check that your front end continues to work with the updated back end; as it executes, you should see a trace of the incoming actions appearing in the console.
