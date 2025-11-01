---
timestamp: 'Fri Oct 31 2025 22:25:36 GMT-0400 (Eastern Daylight Time)'
parent: '[[..\20251031_222536.bd1dae67.md]]'
content_id: ee21802c2bfb0afc09cd90f2fdb72fcd9808969f7bbb291a2bfb3cb701c95e8f
---

# API Specification: Focus Concept

**Purpose:** to eliminate decision fatigue by presenting the single task a user should be working on right now

***

## API Endpoints

### POST /api/Focus/setCurrentTask

**Description:** Sets a specific task as the user's current focus.

**Requirements:**

* (none)

**Effects:**

* sets the specified task as the user's current focus

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

***

### POST /api/Focus/clearCurrentTask

**Description:** Removes the current focus task for a user.

**Requirements:**

* (none)

**Effects:**

* removes the current task for the user

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

### POST /api/Focus/getCurrentTask

**Description:** Retrieves the user's current focus task.

**Requirements:**

* (none)

**Effects:**

* returns the user's current task, if any

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

***
