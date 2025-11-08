---
timestamp: 'Fri Nov 07 2025 10:13:49 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_101349.d84fe7a5.md]]'
content_id: ffb3792a7714af038a926b6dee89d342daf6887afd7761740fc9f74093f82595
---

# file: src/syncs/authorization.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAccount } from "@concepts";

/**
 * =============================================================================
 * AUTHORIZATION PATTERN EXAMPLE
 *
 * All other routes were excluded in `passthrough.ts` because they require
 * authorization. This file demonstrates the standard pattern for protecting an
 * endpoint.
 *
 * The flow for a protected route is:
 * 1. A request is made to a protected path, including a session token.
 * 2. A sync uses the `where` clause to query `Sessioning._getUser`.
 *    - If a user is found, the `where` clause succeeds, and the `then` clause
 *      fires the intended concept action. The request is authorized.
 *    - If no user is found, the `where` clause fails, no further actions are
 *      fired, and the original HTTP request will time out. This correctly
 *      prevents unauthorized access.
 * 3. Subsequent syncs handle the success or error response from the concept
 *    action and send it back to the client via `Requesting.respond`.
 * =============================================================================
 */

/**
 * Example: Getting the current user's profile.
 */
export const GetUserProfileRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAccount/_getUserProfile", session },
    { request },
  ]),
  // Authorize the request by finding the user for the given session.
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  // If authorization succeeds, proceed to get the user's profile.
  then: actions([UserAccount._getUserProfile, { user }]),
});

/**
 * When the profile is successfully retrieved, send it in the response.
 */
export const GetUserProfileResponse: Sync = ({ request, profile }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/_getUserProfile" }, { request }],
    [UserAccount._getUserProfile, {}, { profile }],
  ),
  then: actions([Requesting.respond, { request, profile }]),
});

/**
 * If retrieving the profile fails, send back the error.
 */
export const GetUserProfileResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/_getUserProfile" }, { request }],
    [UserAccount._getUserProfile, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
