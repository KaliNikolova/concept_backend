# API Specification

This document describes the REST API for the Concept Backend. All endpoints use the `POST` method and communicate using `application/json`.

**Base URL:** `/api`

**Authentication:** Most endpoints require session-based authentication using session tokens returned from login.

---

## Authentication Flow

1. **Register** → Creates account (no session needed) - PUBLIC PASSTHROUGH
2. **Login** → Returns session token (store this!) - Uses Requesting + Sync
3. **All other endpoints** → Require session token in request body
4. **Logout** → Invalidates session token

---

# API Specification: UserAccount Concept

**Purpose:** to securely identify and authenticate users

---

## API Endpoints

### POST /api/UserAccount/register

**Description:** Creates a new user account with the provided credentials.

**Authentication:** None required (PUBLIC PASSTHROUGH)

**Requirements:**
- email is not already in use

**Effects:**
- creates a new user with the provided details and a hashed password
- automatically creates an empty task list for the new user (via synchronization)

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "displayName": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAccount/login

**Description:** Authenticates a user and returns a session token.

**Authentication:** None required (credentials-based)

**Note:** This endpoint is excluded from passthrough and uses Requesting + synchronization to create a session.

**Requirements:**
- (none)

**Effects:**
- authenticates the user if the email and password match
- creates a new session via synchronization

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "session": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAccount/logout

**Description:** Invalidates the current session, logging the user out.

**Authentication:** Required (session token)

**Note:** This endpoint is excluded from passthrough and uses Requesting + synchronization to delete the session.

**Requirements:**
- (none)

**Effects:**
- removes the current session

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAccount/updateProfile

**Description:** Updates a user's display name.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- changes the user's displayName

**Request Body:**
```json
{
  "session": "ID",
  "newDisplayName": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAccount/deleteAccount

**Description:** Permanently removes a user's account and their associated data.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- removes the user and all their associated data

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAccount/_getUserProfile

**Description:** Retrieves the public profile information for the authenticated user.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- returns the display name and email of the authenticated user

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Query):**
```json
{
  "profile": {
    "displayName": "string",
    "email": "string"
  }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAccount/setWorkingHours

**Description:** Sets the user's working day hours (start and end times).

**Authentication:** Required (session token)

**Request Body:**
```json
{
  "session": "ID",
  "startTime": "string",
  "endTime": "string"
}
```

**Notes:**
- `startTime` and `endTime` must be in "HH:MM" format (e.g., "09:00", "19:00")
- Times are in 24-hour format

**Success Response Body:**
```json
{
  "status": "ok"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

**Example Errors:**
- "Invalid time format. Use HH:MM"
- "User not found"

---

### POST /api/UserAccount/_getWorkingHours

**Description:** Retrieves the user's working day hours. Returns defaults (09:00-19:00) if not set.

**Authentication:** Required (session token)

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body:**
```json
{
  "workingHours": {
    "start": "string",
    "end": "string"
  }
}
```

**Notes:**
- Times are in "HH:MM" format (24-hour)
- Default values are "09:00" (9 AM) and "19:00" (7 PM) if not set by the user

---

### POST /api/UserAccount/_findUserByEmail

**Description:** Finds a user by their email address.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- returns the user ID if an email exists

**Request Body:**
```json
{
  "session": "ID",
  "email": "string"
}
```

**Success Response Body (Query):**
```json
"ID"
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Tasks Concept

**Purpose:** to capture and organize a user's tasks

---

## API Endpoints

### POST /api/Tasks/createUserTasks

**Description:** Creates an empty task list for a new user.

**Authentication:** Required (session token)

**Requirements:**
- the user doesn't already have a list of tasks created

**Effects:**
- creates an empty UserTasks element for the authenticated user

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Tasks/createTask

**Description:** Creates a new task and adds it to the user's task list.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- creates a new task with status TODO and adds it to the authenticated user's list

**Request Body:**
```json
{
  "session": "ID",
  "title": "string",
  "description": "string",
  "dueDate": "DateTime",
  "estimatedDuration": "number"
}
```

**Success Response Body (Action):**
```json
{
  "task": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Tasks/updateTask

**Description:** Modifies the details of an existing task.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- modifies the details of an existing task

**Request Body:**
```json
{
  "session": "ID",
  "task": "ID",
  "newTitle": "string",
  "newDescription": "string",
  "newDueDate": "DateTime",
  "newEstimatedDuration": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Tasks/reorderTasks

**Description:** Updates the order of a user's tasks.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- updates the order of the authenticated user's tasks

**Request Body:**
```json
{
  "session": "ID",
  "newOrder": ["ID"]
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Tasks/markTaskComplete

**Description:** Marks an existing task as complete.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- sets the task's status to DONE
- automatically retrieves the next scheduled task from the planner (via synchronization)
- automatically sets the next scheduled task as the user's current focus (via synchronization)

**Request Body:**
```json
{
  "session": "ID",
  "task": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Tasks/deleteTask

**Description:** Removes a specific task from the system.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- removes the task from the system

**Request Body:**
```json
{
  "session": "ID",
  "task": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Tasks/deleteAllForUser

**Description:** Removes all tasks associated with the authenticated user.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- removes all tasks associated with the authenticated user

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Tasks/_getTasks

**Description:** Retrieves the authenticated user's full ordered list of tasks.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- returns the authenticated user's full ordered list of tasks

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Query):**
```json
{
  "tasks": [
    {
      "_id": "ID",
      "owner": "ID",
      "title": "string",
      "description": "string",
      "dueDate": "DateTime",
      "estimatedDuration": "number",
      "status": "string"
    }
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Tasks/_getRemainingTasks

**Description:** Retrieves the authenticated user's ordered list of tasks with a 'TODO' status.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- returns the authenticated user's ordered list of tasks with status TODO

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Query):**
```json
{
  "tasks": [
    {
      "_id": "ID",
      "owner": "ID",
      "title": "string",
      "description": "string",
      "dueDate": "DateTime",
      "estimatedDuration": "number",
      "status": "string"
    }
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Schedule Concept

**Purpose:** to represent a user's availability by combining non-negotiable, externally-scheduled commitments with manual time blocks

---

## API Endpoints

### POST /api/Schedule/blockTime

**Description:** Creates a new manual busy slot in the user's schedule.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- creates a new BusySlot for the authenticated user with the given details and sets origin to MANUAL

**Request Body:**
```json
{
  "session": "ID",
  "startTime": "DateTime",
  "endTime": "DateTime",
  "description": "string"
}
```

**Success Response Body (Action):**
```json
{
  "slot": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Schedule/updateSlot

**Description:** Modifies the details of a manually created busy slot.

**Authentication:** Required (session token)

**Requirements:**
- slot.origin is MANUAL

**Effects:**
- modifies the properties of a manually created BusySlot

**Request Body:**
```json
{
  "session": "ID",
  "slot": "ID",
  "startTime": "DateTime",
  "endTime": "DateTime",
  "description": "string"
}
```

**Success Response Body (Action):**
```json
{
  "status": "ok"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Schedule/deleteSlot

**Description:** Deletes a manually created busy slot from the schedule.

**Authentication:** Required (session token)

**Requirements:**
- slot.origin is MANUAL

**Effects:**
- removes a manually created BusySlot

**Request Body:**
```json
{
  "session": "ID",
  "slotId": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Schedule/syncCalendar

**Description:** Updates the user's schedule with events from an external calendar.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- updates the authenticated user's schedule to match their external calendar without affecting MANUAL blocks

**Request Body:**
```json
{
  "session": "ID",
  "externalEvents": [
    {
      "startTime": "DateTime",
      "endTime": "DateTime",
      "description": "string"
    }
  ]
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Schedule/deleteAllForUser

**Description:** Removes all busy slots, both manual and external, for the authenticated user.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- removes all busy slots (both MANUAL and EXTERNAL) for the authenticated user

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Schedule/_getSlots

**Description:** Retrieves all busy slots for the authenticated user.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- returns all busy slots for the authenticated user, regardless of origin

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Query):**
```json
{
  "slots": [
    {
      "_id": "ID",
      "owner": "ID",
      "startTime": "DateTime",
      "endTime": "DateTime",
      "description": "string",
      "origin": "string"
    }
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Planner Concept

**Purpose:** having a realistic, time-based plan for a user's tasks

---

## API Endpoints

### POST /api/Planner/planDay

**Description:** Creates a new, full-day schedule by assigning tasks to available time slots.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- creates a new, full-day schedule by assigning tasks to available time slots for the authenticated user; returns the first task, if any
- automatically sets the first scheduled task as the user's current focus (via synchronization)

**Request Body:**
```json
{
  "session": "ID",
  "tasks": [
    {
      "id": "ID",
      "duration": "number"
    }
  ],
  "busySlots": [
    {
      "start": "DateTime",
      "end": "DateTime"
    }
  ]
}
```

**Success Response Body (Action):**
```json
{
  "firstTask": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Planner/replan

**Description:** Discards remaining scheduled tasks and generates a new plan from the current time forward.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- discards remaining scheduled tasks for the authenticated user and generates a new plan from the current time forward; returns the first task, if any
- automatically sets the first scheduled task as the user's current focus (via synchronization)

**Request Body:**
```json
{
  "session": "ID",
  "tasks": [
    {
      "id": "ID",
      "duration": "number"
    }
  ],
  "busySlots": [
    {
      "start": "DateTime",
      "end": "DateTime"
    }
  ]
}
```

**Success Response Body (Action):**
```json
{
  "firstTask": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Planner/clearDay

**Description:** Removes all scheduled tasks for the user for the current day.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- removes all ScheduledTasks for the authenticated user for the current day

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Planner/deleteAllForUser

**Description:** Removes all scheduled tasks for the authenticated user.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- removes all scheduled tasks for the authenticated user

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Planner/getNextTask

**Description:** Finds and returns the task scheduled immediately after a given completed task.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- finds the task scheduled immediately after the completedTask for the authenticated user and returns it

**Request Body:**
```json
{
  "session": "ID",
  "completedTask": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "nextTask": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Planner/_getScheduledTasks

**Description:** Retrieves all scheduled tasks for the authenticated user.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- returns all scheduled tasks for the authenticated user, sorted by start time

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Query):**
```json
{
  "tasks": [
    {
      "_id": "ID",
      "owner": "ID",
      "task": "ID",
      "plannedStart": "DateTime",
      "plannedEnd": "DateTime"
    }
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Planner/_scheduleTasks

**Description:** Internal scheduling logic to fit tasks into available time slots.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- schedules tasks into available slots for the authenticated user and returns the first scheduled task

**Request Body:**
```json
{
  "session": "ID",
  "tasks": [
    {
      "id": "ID",
      "duration": "number"
    }
  ],
  "busySlots": [
    {
      "start": "DateTime",
      "end": "DateTime"
    }
  ]
}
```

**Success Response Body (Action):**
```json
{
  "firstTask": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Planner/_getAvailableSlots

**Description:** Calculates available time slots within a given window, excluding busy periods.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- returns available time slots

**Request Body:**
```json
{
  "session": "ID",
  "start": "DateTime",
  "end": "DateTime",
  "busySlots": [
    {
      "start": "DateTime",
      "end": "DateTime"
    }
  ]
}
```

**Success Response Body (Query):**
```json
[
  {
    "start": "DateTime",
    "end": "DateTime"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Focus Concept

**Purpose:** to eliminate decision fatigue by presenting the single task a user should be working on right now

---

## API Endpoints

### POST /api/Focus/setCurrentTask

**Description:** Sets a specific task as the user's current focus.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- sets the specified task as the authenticated user's current focus

**Request Body:**
```json
{
  "session": "ID",
  "task": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Focus/clearCurrentTask

**Description:** Removes the current focus task for the authenticated user.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- removes the current task for the authenticated user

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Focus/_getCurrentTask

**Description:** Retrieves the authenticated user's current focus task.

**Authentication:** Required (session token)

**Requirements:**
- (none)

**Effects:**
- returns the authenticated user's current task, if any

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Query):**
```json
{
  "task": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Sessioning Concept

**Purpose:** to maintain a user's logged-in state across multiple requests without re-sending credentials

**Note:** These endpoints are internal and used via synchronizations. They are not directly called by frontend applications.

---

## API Endpoints

### POST /api/Sessioning/create

**Description:** Creates a new session for a user.

**Note:** This action is triggered via synchronization during login. Not called directly.

**Requirements:**
- (none)

**Effects:**
- creates a new Session and associates it with the given user; returns the session ID

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "session": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Sessioning/delete

**Description:** Removes a session, logging the user out.

**Note:** This action is triggered via synchronization during logout. Not called directly.

**Requirements:**
- the given session exists

**Effects:**
- removes the session

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Sessioning/_getUser

**Description:** Retrieves the user associated with a session.

**Note:** This query is used internally by synchronizations to resolve sessions to users.

**Requirements:**
- the given session exists

**Effects:**
- returns the user associated with the session

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Query):**
```json
{
  "user": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Requesting Concept

**Purpose:** to encapsulate an API server, modeling incoming requests and outgoing responses as concept actions

**Note:** This concept is used internally by the server architecture. These endpoints are not directly called by frontend applications.

---

## API Endpoints

### POST /api/Requesting/request

**Description:** System action triggered by an external HTTP request.

**Note:** This is automatically called by the Requesting server for all excluded routes.

**Requirements:**
- (none)

**Effects:**
- creates a new Request; sets the input to be the path and all other input parameters; returns the request ID

**Request Body:**
```json
{
  "path": "string"
}
```

**Success Response Body (Action):**
```json
{
  "request": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Requesting/respond

**Description:** Provides a response to a pending request.

**Note:** This is called by synchronizations to respond to requests.

**Requirements:**
- a Request with the given request id exists and has no response yet

**Effects:**
- sets the response of the given Request to the provided data

**Request Body:**
```json
{
  "request": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "request": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Requesting/_awaitResponse

**Description:** Returns the response associated with a request, waiting if necessary up to a configured timeout.

**Note:** This is used internally by the Requesting server to wait for synchronizations to provide responses.

**Requirements:**
- (none)

**Effects:**
- returns the response associated with the given request

**Request Body:**
```json
{
  "request": "ID"
}
```

**Success Response Body (Query):**
```json
{
  "response": "unknown"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

## Implementation Notes

### Passthrough Configuration

Based on `src/concepts/Requesting/passthrough.ts`:

**Public Passthrough Routes (no authentication):**
- `/api/UserAccount/register` - Direct passthrough to concept

**Excluded Routes (require session authentication via Requesting + Syncs):**
- All other endpoints listed in this specification

### Session Management

All authenticated endpoints:
1. Accept `session` token in request body
2. Are processed through Requesting concept
3. Use synchronizations to resolve session → user
4. Execute the actual concept action with the authenticated user

### Automatic Behaviors via Synchronizations

The backend uses synchronizations to coordinate between concepts automatically. The following behaviors occur without requiring additional API calls:

**User Registration:**
- When a user registers (`/api/UserAccount/register`), an empty task list is automatically created for them
- No need to manually call `/api/Tasks/createUserTasks`

**Planning:**
- When planning a day (`/api/Planner/planDay`), the first scheduled task is automatically set as the current focus
- When replanning (`/api/Planner/replan`), the first scheduled task is automatically set as the current focus
- No need to manually call `/api/Focus/setCurrentTask`

**Task Completion:**
- When marking a task complete (`/api/Tasks/markTaskComplete`), the system automatically:
  1. Retrieves the next scheduled task from the planner
  2. Sets that task as the user's current focus
- No need to manually call `/api/Planner/getNextTask` or `/api/Focus/setCurrentTask`

These automatic behaviors reduce the number of API calls needed from the frontend and ensure data consistency across concepts.

### Error Handling

- **Invalid/Missing Session:** Request will timeout (no response)
- **General Errors:** `{ "error": "Descriptive error message" }`
- **Timeout:** Requests timeout after 10000ms (configurable)

---
