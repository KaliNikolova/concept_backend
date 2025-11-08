---
timestamp: 'Fri Nov 07 2025 10:48:18 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_104818.a1c88348.md]]'
content_id: 56cc550f36677e33512d931ff5156bb103d9da456d3f1449a6438718da0095a3
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, UserAccount, Sessioning } from "@concepts";

/**
 * =============================================================================
 * LOGIN FLOW
 * This multi-step flow is triggered by an excluded route `/api/UserAccount/login`.
 * It coordinates UserAccount and Sessioning to authenticate a user and
 * create a session for them.
 * =============================================================================
 */

/**
 * @sync LoginRequest
 * @when an HTTP request is made to log in
 * @then it attempts to authenticate the user's credentials using the UserAccount concept.
 */
export const LoginRequest: Sync = ({ request, email, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/UserAccount/login", email, password },
    { request },
  ]),
  then: actions([UserAccount.login, { email, password }]),
});

/**
 * @sync LoginSuccess
 * @when a login request was made AND the user was successfully authenticated
 * @then a new session is created for that user.
 */
export const LoginSuccess: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/api/UserAccount/login" }, { request }],
    [UserAccount.login, {}, { user }],
  ),
  then: actions([Sessioning.create, { user }]),
});

/**
 * @sync LoginSessionResponse
 * @when a session was successfully created following a login
 * @then the new session ID is sent back as the HTTP response.
 */
export const LoginSessionResponse: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/api/UserAccount/login" }, { request }],
    [UserAccount.login, {}, {}], // ensure login happened in the flow
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

/**
 * @sync LoginErrorResponse
 * @when a login request was made AND the authentication failed
 * @then the error message is sent back as the HTTP response.
 */
export const LoginErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/api/UserAccount/login" }, { request }],
    [UserAccount.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * LOGOUT FLOW
 * Handles logging a user out by deleting their session.
 * =============================================================================
 */

/**
 * @sync LogoutRequest
 * @when an HTTP request is made to log out with a valid session
 * @then the corresponding session is deleted.
 */
export const LogoutRequest: Sync = ({ request, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Sessioning/delete", session }, // A conventional path for logout
    { request },
  ]),
  then: actions([Sessioning.delete, { session }]),
});

/**
 * @sync LogoutResponse
 * @when a logout request was made AND the session was successfully deleted
 * @then a confirmation status is sent back as the HTTP response.
 */
export const LogoutResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Sessioning/delete" }, { request }],
    [Sessioning.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "logged_out" }]),
});


/**
 * =============================================================================
 * AUTHORIZATION PATTERN
 * This demonstrates how to protect an excluded route. The `where` clause
 * acts as an authorization middleware by checking for a valid session.
 * =============================================================================
 */

/**
 * @sync GetUserProfileRequest (Protected Route)
 * @when a request is made to get a user profile, providing a session
 * @where the provided session is valid and belongs to a user
 * @then the user's profile information is sent back as the HTTP response.
 *
 * NOTE: This single sync handles both the action and response because it's a simple query.
 * For actions that modify state, it's better to use a request/response sync pair.
 */
export const GetUserProfileRequest: Sync = ({ request, session, user, profile }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/UserAccount/_getUserProfile", session },
    { request },
  ]),
  where: async (frames) => {
    // 1. Authorize: Check if the session is valid and get the associated user.
    // If this query fails (returns []), `frames` becomes empty and the `then` clause doesn't fire.
    frames = await frames.query(Sessioning._getUser, { session }, { user });

    // 2. Act: If authorized, fetch the profile for that user.
    // This now works because _getUserProfile returns the correct array shape.
    frames = await frames.query(UserAccount._getUserProfile, { user }, { profile });

    return frames;
  },
  then: actions([Requesting.respond, { request, profile }]),
});
```
