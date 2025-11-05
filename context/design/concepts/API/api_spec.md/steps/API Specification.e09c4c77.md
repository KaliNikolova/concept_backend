---
timestamp: 'Mon Nov 03 2025 17:53:09 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251103_175309.8a5efd6d.md]]'
content_id: e09c4c773a9d2827c632dbea8707650d633153c14b949c5bba58bb8c4e89bcb9
---

# API Specification: Tasks Concept

**Purpose:** to capture and organize a user's tasks

***

## API Endpoints

### POST /api/Tasks/createUserTasks

**Description:** Creates an empty task list for a new user.

**Requirements:**

* the user doesn't already have a list of tasks created

**Effects:**

* creates an empty UserTasks element for a new user

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

### POST /api/Tasks/createTask

**Description:** Creates a new task and adds it to the user's task list.

**Requirements:**

* (none)

**Effects:**

* creates a new task with status TODO and adds it to the user's list

**Request Body:**

```json
{
  "owner": "ID",
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

***

### POST /api/Tasks/updateTask

**Description:** Modifies the details of an existing task.

**Requirements:**

* (none)

**Effects:**

* modifies the details of an existing task

**Request Body:**

```json
{
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

***

### POST /api/Tasks/reorderTasks

**Description:** Updates the order of a user's tasks.

**Requirements:**

* (none)

**Effects:**

* updates the order of the user's tasks

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

***

### POST /api/Tasks/markTaskComplete

**Description:** Marks an existing task as complete.

**Requirements:**

* (none)

**Effects:**

* sets the task's status to DONE

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

***

### POST /api/Tasks/deleteTask

**Description:** Removes a specific task from the system.

**Requirements:**

* (none)

**Effects:**

* removes the task from the system

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

***

### POST /api/Tasks/deleteAllForUser

**Description:** Removes all tasks associated with a user.

**Requirements:**

* (none)

**Effects:**

* removes all tasks associated with the user

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

### POST /api/Tasks/\_getTasks

**Description:** Retrieves a user's full ordered list of tasks.

**Requirements:**

* (none)

**Effects:**

* returns the user's full ordered list of tasks

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
    "title": "string",
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

***

### POST /api/Tasks/\_getRemainingTasks

**Description:** Retrieves a user's ordered list of tasks with a 'TODO' status.

**Requirements:**

* (none)

**Effects:**

* returns the user's ordered list of tasks with status TODO

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
    "title": "string",
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

***
