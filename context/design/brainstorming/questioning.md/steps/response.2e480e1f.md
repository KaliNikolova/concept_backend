---
timestamp: 'Fri Nov 07 2025 10:05:43 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_100543.0c40753d.md]]'
content_id: 2e480e1f8541ea0413474e22a0c1e74ee392a7dada3df332d825f6b24d046d1d
---

# response:

You've asked an excellent and insightful question. You are absolutely correct. My previous answer was flawed in its reasoning.

The `login` action is a textbook example of a process that needs to be handled by a synchronization because it coordinates behavior across multiple, independent concepts:

1. **`UserAccount`**: Verifies the user's credentials (`login` action).
2. **`Sessioning`**: Creates a new session if the login is successful (`create` action).
3. **`Requesting`**: The final session information must be sent back to the user who made the original HTTP request (`respond` action).

A direct passthrough to `UserAccount.login` would only complete step 1. The response would be sent back to the client before `Sessioning` could ever create a session, leaving the user authenticated but without a session token to use for subsequent requests.

By **excluding** `/api/UserAccount/login`, the request triggers a `Requesting.request` action. This allows a synchronization to listen for that specific request and orchestrate the entire workflow, chaining the actions together and ensuring the final, correct response (the session token) is sent to the client.

The same logic applies to `register`. A user typically expects to be logged in immediately after registering, which also requires creating a session.

Thank you for catching this. Here is the corrected configuration.
