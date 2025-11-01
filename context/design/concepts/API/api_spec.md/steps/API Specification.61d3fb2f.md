---
timestamp: 'Fri Oct 31 2025 22:25:36 GMT-0400 (Eastern Daylight Time)'
parent: '[[..\20251031_222536.bd1dae67.md]]'
content_id: 61d3fb2f494bbd7e998863d67ec1349159690eb200e9dd8f0a6662e1c80b654c
---

# API Specification: UserAccount Concept

**Purpose:** to securely identify and authenticate users

***

## API Endpoints

### POST /api/UserAccount/register

**Description:** Creates a new user account with the provided credentials.

**Requirements:**

* email is not already in use

**Effects:**

* creates a new user with the provided details and a hashed password

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

***

### POST /api/UserAccount/login

**Description:** Authenticates a user based on their email and password.

**Requirements:**

* (none)

**Effects:**

* authenticates the user if the email and password match.

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

***

### POST /api/UserAccount/updateProfile

**Description:** Updates a user's display name.

**Requirements:**

* (none)

**Effects:**

* changes the user's displayName

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

***

### POST /api/UserAccount/deleteAccount

**Description:** Permanently removes a user's account and their associated data.

**Requirements:**

* (none)

**Effects:**

* removes the user and all their associated data

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

### POST /api/UserAccount/\_getUserProfile

**Description:** Retrieves the public profile information for a specific user.

**Requirements:**

* (none)

**Effects:**

* returns the display name and email of a user.

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

***

### POST /api/UserAccount/\_findUserByEmail

**Description:** Finds a user by their email address.

**Requirements:**

* (none)

**Effects:**

* returns the user ID if an email exists.

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

***
