# spec: API Spec
[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)

Please extract an API for this app from the following five concepts:

## UserAccount

Specification:

[@UserAccount](../UserAccount/UserAccount.md)

Code:

[@UserAccountConcept.ts](../../../src/concepts/UserAccount/UserAccountConcept.ts)

## Tasks

Specification:

[@Tasks](../Tasks/Tasks.md)

Code:

[@TasksConcept.ts](../../../src/concepts/Tasks/TasksConcept.ts)


## Schedule

Specification:

[@Schedule](../Schedule/Schedule.md)

Code:

[@ScheduleConcept.ts](../../../src/concepts/Schedule/ScheduleConcept.ts)


## Planner

Specification:

[@Planner](../Planner/Planner.md)

Code:

[@PlannerConcept.ts](../../../src/concepts/Planner/PlannerConcept.ts)


## Focus

Specification:

[@Focus](../Focus/Focus.md)

Code:

[@FocusConcept.ts](../../../src/concepts/Focus/FocusConcept.ts)
# response:

# API Specification: UserAccount Concept

**Purpose:** to securely identify and authenticate users

---

## API Endpoints

### POST /api/UserAccount/register

**Description:** Creates a new user account with the provided credentials.

**Requirements:**
- email is not already in use

**Effects:**
- creates a new user with the provided details and a hashed password

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

**Description:** Authenticates a user based on their email and password.

**Requirements:**
- (none)

**Effects:**
- authenticates the user if the email and password match.

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
### POST /api/UserAccount/updateProfile

**Description:** Updates a user's display name.

**Requirements:**
- (none)

**Effects:**
- changes the user's displayName

**Request Body:**
```json
{
  "user": "ID",
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

**Requirements:**
- (none)

**Effects:**
- removes the user and all their associated data

**Request Body:**
```json
{
  "user": "ID"
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

**Description:** Retrieves the public profile information for a specific user.

**Requirements:**
- (none)

**Effects:**
- returns the display name and email of a user.

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "displayName": "string",
    "email": "string"
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
### POST /api/UserAccount/_findUserByEmail

**Description:** Finds a user by their email address.

**Requirements:**
- (none)

**Effects:**
- returns the user ID if an email exists.

**Request Body:**
```json
{
  "email": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": "ID"
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
# API Specification: Tasks Concept

**Purpose:** to capture and organize a user's tasks

---

## API Endpoints

### POST /api/Tasks/createUserTasks

**Description:** Creates an empty task list for a new user.

**Requirements:**
- the user doesn't already have a list of tasks created

**Effects:**
- creates an empty UserTasks element for a new user

**Request Body:**
```json
{
  "user": "ID"
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

**Requirements:**
- (none)

**Effects:**
- creates a new task with status TODO and adds it to the user's list

**Request Body:**
```json
{
  "owner": "ID",
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

**Requirements:**
- (none)

**Effects:**
- modifies the details of an existing task

**Request Body:**
```json
{
  "task": "ID",
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

**Requirements:**
- (none)

**Effects:**
- updates the order of the user's tasks

**Request Body:**
```json
{
  "user": "ID",
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

**Requirements:**
- (none)

**Effects:**
- sets the task's status to DONE

**Request Body:**
```json
{
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

**Requirements:**
- (none)

**Effects:**
- removes the task from the system

**Request Body:**
```json
{
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

**Description:** Removes all tasks associated with a user.

**Requirements:**
- (none)

**Effects:**
- removes all tasks associated with the user

**Request Body:**
```json
{
  "user": "ID"
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

**Description:** Retrieves a user's full ordered list of tasks.

**Requirements:**
- (none)

**Effects:**
- returns the user's full ordered list of tasks

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "ID",
    "owner": "ID",
    "description": "string",
    "dueDate": "DateTime",
    "estimatedDuration": "number",
    "status": "string"
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
### POST /api/Tasks/_getRemainingTasks

**Description:** Retrieves a user's ordered list of tasks with a 'TODO' status.

**Requirements:**
- (none)

**Effects:**
- returns the user's ordered list of tasks with status TODO

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "ID",
    "owner": "ID",
    "description": "string",
    "dueDate": "DateTime",
    "estimatedDuration": "number",
    "status": "string"
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
# API Specification: Schedule Concept

**Purpose:** to represent a user's availability by combining non-negotiable, externally-scheduled commitments with manual time blocks

---

## API Endpoints

### POST /api/Schedule/blockTime

**Description:** Creates a new manual busy slot in the user's schedule.

**Requirements:**
- (none)

**Effects:**
- creates a new BusySlot for the user with the given details and sets origin to MANUAL

**Request Body:**
```json
{
  "user": "ID",
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

**Requirements:**
- slot.origin is MANUAL

**Effects:**
- modifies the properties of a manually created BusySlot

**Request Body:**
```json
{
  "slotId": "ID",
  "newStartTime": "DateTime",
  "newEndTime": "DateTime",
  "newDescription": "string"
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
### POST /api/Schedule/deleteSlot

**Description:** Deletes a manually created busy slot from the schedule.

**Requirements:**
- slot.origin is MANUAL

**Effects:**
- removes a manually created BusySlot

**Request Body:**
```json
{
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

**Requirements:**
- (none)

**Effects:**
- updates the user's schedule to match their external calendar without affecting MANUAL blocks.

**Request Body:**
```json
{
  "user": "ID",
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

**Description:** Removes all busy slots, both manual and external, for a user.

**Requirements:**
- (none)

**Effects:**
- removes all busy slots (both MANUAL and EXTERNAL) for the user.

**Request Body:**
```json
{
  "user": "ID"
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

**Description:** Retrieves all busy slots for a user.

**Requirements:**
- (none)

**Effects:**
- returns all busy slots for the user, regardless of origin

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "ID",
    "owner": "ID",
    "startTime": "DateTime",
    "endTime": "DateTime",
    "description": "string",
    "origin": "string"
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
# API Specification: Planner Concept

**Purpose:** having a realistic, time-based plan for a user's tasks

---

## API Endpoints

### POST /api/Planner/planDay

**Description:** Creates a new, full-day schedule by assigning tasks to available time slots.

**Requirements:**
- (none)

**Effects:**
- creates a new, full-day schedule by assigning tasks to available time slots; returns the first task, if any

**Request Body:**
```json
{
  "user": "ID",
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

**Requirements:**
- (none)

**Effects:**
- discards remaining scheduled tasks and generates a new plan from the current time forward; returns the first task, if any

**Request Body:**
```json
{
  "user": "ID",
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

**Requirements:**
- (none)

**Effects:**
- removes all ScheduledTasks for the given user for the current day

**Request Body:**
```json
{
  "user": "ID"
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

**Description:** Removes all scheduled tasks for the user.

**Requirements:**
- (none)

**Effects:**
- removes all scheduled tasks for the user

**Request Body:**
```json
{
  "user": "ID"
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

**Requirements:**
- (none)

**Effects:**
- finds the task scheduled immediately after the completedTask and returns it

**Request Body:**
```json
{
  "user": "ID",
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
# API Specification: Focus Concept

**Purpose:** to eliminate decision fatigue by presenting the single task a user should be working on right now

---

## API Endpoints

### POST /api/Focus/setCurrentTask

**Description:** Sets a specific task as the user's current focus.

**Requirements:**
- (none)

**Effects:**
- sets the specified task as the user's current focus

**Request Body:**
```json
{
  "user": "ID",
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

**Description:** Removes the current focus task for a user.

**Requirements:**
- (none)

**Effects:**
- removes the current task for the user

**Request Body:**
```json
{
  "user": "ID"
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
### POST /api/Focus/getCurrentTask

**Description:** Retrieves the user's current focus task.

**Requirements:**
- (none)

**Effects:**
- returns the user's current task, if any

**Request Body:**
```json
{
  "user": "ID"
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