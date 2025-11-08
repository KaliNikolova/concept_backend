---
timestamp: 'Fri Nov 07 2025 10:13:49 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_101349.d84fe7a5.md]]'
content_id: c099ecdfc926b1920b0fb26d279f7304816e67d6424e360bcb8e65f145f0c535
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, UserAccount, Sessioning } from "@concepts";

/**
 * =============================================================================
 * LOGIN FLOW
 *
 * This series of synchronizations handles the multi-step login process:
 * 1. An HTTP request to `/UserAccount/login` triggers `UserAccount.login`.
 * 2. A successful login triggers `Sessioning.create` to start a new session.
 * 3. A successful session creation triggers `Requesting.respond` with the session.
 * 4. A failed login triggers `Requesting.respond` with an error.
 * =============================================================================
 */

/**
 * Step 1: When a login request is received, attempt to log in the user.
 */
export const LoginRequest: Sync = ({ request, email, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAccount/login", email, password },
    { request },
  ]),
  then: actions([UserAccount.login, { email, password }]),
});

/**
 * Step 2: If the user login is successful, create a session for that user.
 */
export const CreateSessionOnLoginSuccess: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/login" }, { request }],
    [UserAccount.login, {}, { user }],
  ),
  then: actions([Sessioning.create, { user }]),
});

/**
 * Step 3: If a session is successfully created, respond to the original
 * HTTP request with the new session ID.
 */
export const RespondWithSession: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/login" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

/**
 * Step 4: If the user login fails, respond with the error message.
 */
export const RespondWithLoginError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/login" }, { request }],
    [UserAccount.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * LOGOUT FLOW
 *
 * This series of synchronizations handles logging a user out by deleting their
 * session token. A conventional `/logout` endpoint is used.
 * =============================================================================
 */

/**
 * When a request is made to /logout with a session, trigger its deletion.
 */
export const LogoutRequest: Sync = ({ request, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/logout", session },
    { request },
  ]),
  then: actions([Sessioning.delete, { session }]),
});

/**
 * Respond successfully when the session is confirmed to be deleted.
 */
export const LogoutResponseSuccess: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.delete, {}, { session }],
  ),
  then: actions([
    Requesting.respond,
    { request, status: "logged_out" },
  ]),
});

/**
 * Respond with an error if session deletion fails (e.g., session not found).
 */
export const LogoutResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.delete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
