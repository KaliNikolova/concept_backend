---
timestamp: 'Fri Nov 07 2025 18:08:49 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_180849.d7f4a397.md]]'
content_id: 00a78f4704e515d7fafed35e391aaa398a3cf675025ffbc5778a717e37d14f66
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Frames, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication } from "@concepts";

/**
 * --- REGISTRATION ---
 * A request to register a new user triggers the UserAuthentication.register action.
 */
export const RegisterRequest: Sync = (
  { request, username, password },
) => ({
  when: actions([
    Requesting.request,
    { path: "/register", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.register, { username, password }]),
});

/**
 * Responds to the registration request with the new user's ID on success.
 */
export const RegisterResponseSuccess: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

/**
 * Responds to the registration request with an error message on failure.
 */
export const RegisterResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/register" }, { request }],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * --- LOGIN ---
 * A request to log in triggers the UserAuthentication.login action.
 */
export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/login", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

/**
 * If login is successful (returns a user), a new session is started for that user.
 */
export const LoginSuccessStartSession: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions([Sessioning.start, { user }]),
});

/**
 * If a new session is started successfully, respond to the original login
 * request with the new session ID.
 */
export const LoginResponseSession: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/login" }, { request }],
    [Sessioning.start, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

/**
 * If login fails, respond to the original request with the error message.
 */
export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * --- LOGOUT ---
 * A request to log out triggers the Sessioning.end action.
 */
export const LogoutRequest: Sync = ({ request, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/logout", session },
    { request },
  ]),
  then: actions([Sessioning.end, { session }]),
});

/**
 * Responds to the logout request with a success message.
 */
export const LogoutResponseSuccess: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.end, {}, { session }],
  ),
  then: actions(
    [Requesting.respond, { request, status: "logged_out", session }],
  ),
});

/**
 * Responds to the logout request with an error if ending the session failed.
 */
export const LogoutResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.end, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * --- WHO AM I ---
 * Handles a request to identify the user associated with a given session.
 * This sync demonstrates handling both success and failure (e.g., invalid session)
 * in a single, robust where clause.
 */
export const WhoAmIRequest: Sync = (
  { request, session, user, username, error },
) => ({
  when: actions([
    Requesting.request,
    { path: "/me", session },
    { request },
  ]),
  where: async (frames) => {
    // Attempt to find a user for the given session.
    const userFrames = await frames.query(Sessioning._getUser, { session }, {
      user,
    });

    // If no frames are returned, the session is invalid or expired.
    if (userFrames.length === 0) {
      const originalFrame = frames[0];
      const errorFrame = {
        ...originalFrame,
        [error]: "Invalid or expired session",
      };
      // Return a new set of frames containing just the error response.
      return new Frames(errorFrame);
    }

    // If a user was found, enrich the frames with the username.
    return await userFrames.query(
      UserAuthentication._getUsername,
      { user },
      { username },
    );
  },
  // This 'then' clause works for both the success and error frames generated
  // by the 'where' clause. The engine binds whichever variables are present.
  then: actions([Requesting.respond, { request, user, username, error }]),
});
```
