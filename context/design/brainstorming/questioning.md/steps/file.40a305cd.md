---
timestamp: 'Fri Nov 07 2025 18:11:16 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_181116.3a5ae1e9.md]]'
content_id: 40a305cdda75b5fd10bd43b6ef4f6631b46a8ab2f1a0ec88e8bc284bfb1b344f
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication } from "@concepts";

/**
 * Assumed Concept Signatures for UserAuthentication and Sessioning
 *
 * concept UserAuthentication [User]
 *   actions
 *     register (username: String, password: String): (user: User)
 *     register (username: String, password: String): (error: String)
 *     login (username: String, password: String): (user: User)
 *     login (username: String, password: String): (error: String)
 *
 * concept Sessioning [User, Session]
 *   actions
 *     create (user: User): (session: Session)
 *     logout (session: Session): (session: Session)
 *     logout (session: Session): (error: String)
 *   queries
 *     _getUser (session: Session): (user: User)
 */

// -- REGISTRATION --

/**
 * Catches a request to register a new user and fires the corresponding
 * UserAuthentication action.
 */
export const RegisterRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/register", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.register, { username, password }]),
});

/**
 * Responds to the original request after a user has been successfully created.
 */
export const RegisterResponseSuccess: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

/**
 * Responds to the original request with an error if user creation failed.
 */
export const RegisterResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- LOGIN --

/**
 * Catches a request to log in and fires the corresponding UserAuthentication action.
 */
export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

/**
 * When login is successful, this sync fires the Sessioning.create action
 * to generate a new session for the authenticated user.
 */
export const CreateSessionOnLogin: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions([Sessioning.create, { user }]),
});

/**
 * Responds to the original login request with the newly created session.
 */
export const LoginResponseSuccess: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

/**
 * Responds to the original login request with an error if login failed.
 */
export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- LOGOUT --

/**
 * Catches a request to log out and fires the corresponding Sessioning action.
 */
export const LogoutRequest: Sync = ({ request, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/Sessioning/logout", session },
    { request },
  ]),
  then: actions([Sessioning.logout, { session }]),
});

/**
 * Responds to the original request after a session has been successfully invalidated.
 */
export const LogoutResponseSuccess: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/logout" }, { request }],
    [Sessioning.logout, {}, { session }],
  ),
  then: actions([
    Requesting.respond,
    { request, status: `Session ${session} successfully logged out.` },
  ]),
});

/**
 * Responds to the original request with an error if session invalidation failed.
 */
export const LogoutResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/logout" }, { request }],
    [Sessioning.logout, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
