---
timestamp: 'Fri Oct 31 2025 22:25:36 GMT-0400 (Eastern Daylight Time)'
parent: '[[..\20251031_222536.bd1dae67.md]]'
content_id: eb78c26d4a7a218d087507f0e9f0f6c9f56ed5ad085a352d397c5467cf629244
---

# API Specification: Schedule Concept

**Purpose:** to represent a user's availability by combining non-negotiable, externally-scheduled commitments with manual time blocks

***

## API Endpoints

### POST /api/Schedule/blockTime

**Description:** Creates a new manual busy slot in the user's schedule.

**Requirements:**

* (none)

**Effects:**

* creates a new BusySlot for the user with the given details and sets origin to MANUAL

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

***

### POST /api/Schedule/updateSlot

**Description:** Modifies the details of a manually created busy slot.

**Requirements:**

* slot.origin is MANUAL

**Effects:**

* modifies the properties of a manually created BusySlot

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

***

### POST /api/Schedule/deleteSlot

**Description:** Deletes a manually created busy slot from the schedule.

**Requirements:**

* slot.origin is MANUAL

**Effects:**

* removes a manually created BusySlot

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

***

### POST /api/Schedule/syncCalendar

**Description:** Updates the user's schedule with events from an external calendar.

**Requirements:**

* (none)

**Effects:**

* updates the user's schedule to match their external calendar without affecting MANUAL blocks.

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

***

### POST /api/Schedule/deleteAllForUser

**Description:** Removes all busy slots, both manual and external, for a user.

**Requirements:**

* (none)

**Effects:**

* removes all busy slots (both MANUAL and EXTERNAL) for the user.

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

### POST /api/Schedule/\_getSlots

**Description:** Retrieves all busy slots for a user.

**Requirements:**

* (none)

**Effects:**

* returns all busy slots for the user, regardless of origin

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

***
