---
timestamp: 'Fri Oct 31 2025 22:25:36 GMT-0400 (Eastern Daylight Time)'
parent: '[[..\20251031_222536.bd1dae67.md]]'
content_id: 4e252b89af63cdb2196b0c50d781751fc8d011b9df1ead833aa9b2c181530189
---

# API Specification: Planner Concept

**Purpose:** having a realistic, time-based plan for a user's tasks

***

## API Endpoints

### POST /api/Planner/planDay

**Description:** Creates a new, full-day schedule by assigning tasks to available time slots.

**Requirements:**

* (none)

**Effects:**

* creates a new, full-day schedule by assigning tasks to available time slots; returns the first task, if any

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

***

### POST /api/Planner/replan

**Description:** Discards remaining scheduled tasks and generates a new plan from the current time forward.

**Requirements:**

* (none)

**Effects:**

* discards remaining scheduled tasks and generates a new plan from the current time forward; returns the first task, if any

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

***

### POST /api/Planner/clearDay

**Description:** Removes all scheduled tasks for the user for the current day.

**Requirements:**

* (none)

**Effects:**

* removes all ScheduledTasks for the given user for the current day

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

***

### POST /api/Planner/deleteAllForUser

**Description:** Removes all scheduled tasks for the user.

**Requirements:**

* (none)

**Effects:**

* removes all scheduled tasks for the user

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

***

### POST /api/Planner/getNextTask

**Description:** Finds and returns the task scheduled immediately after a given completed task.

**Requirements:**

* (none)

**Effects:**

* finds the task scheduled immediately after the completedTask and returns it

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

***
