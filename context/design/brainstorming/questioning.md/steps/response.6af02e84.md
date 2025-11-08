---
timestamp: 'Fri Nov 07 2025 10:12:26 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_101226.895c9b5f.md]]'
content_id: 6af02e847bc1d6d18d389ce91e29bfb7d0ba8f26e8af8d510e9b8bd1043a9da3
---

# response:

You are absolutely right to question that, and you've hit on a very important design choice that depends entirely on the desired user experience. My apologies for the confusion—let's walk through the logic, because your reasoning is perfectly valid for a common registration flow.

You've described this flow:

1. A new user fills out the registration form.
2. The `register` action in `UserAccount` is called. It creates the user in the database.
3. The frontend then redirects the user to the login page.
4. The user logs in, which then creates a session.

In this scenario, the `register` action is a single, self-contained, public-facing operation. It doesn't need to coordinate with `Sessioning` or any other concept. **Therefore, making it a passthrough `inclusion` is the correct and most efficient choice.**

The alternative flow (which my previous answer implicitly assumed) is where registration automatically logs the user in:

1. A new user fills out the registration form.
2. A synchronization is triggered that *first* calls `UserAccount.register` and *then* calls `Sessioning.create`.
3. A session token is returned directly, and the user is immediately logged into the app.

Since the flow you described is simpler and very common, we will go with that. `register` can be a passthrough. `login`, however, **must** remain an exclusion because it absolutely has to coordinate with `Sessioning` to be useful.

### Can any other routes be included?

Let's re-evaluate the list with this "is it a truly public, self-contained action?" mindset:

* **`Focus`, `Planner`, `Schedule`, `Tasks` concepts:** No. Every single action in these concepts relates to the data of a *specific, authenticated user*. Exposing them publicly would be a massive security hole. They must be excluded so a sync can check for a valid session before proceeding.
* **`Sessioning` concept:** Absolutely not. Directly exposing `Sessioning.create` or `Sessioning.delete` would allow anyone to create or destroy sessions at will, completely breaking the security model.
* **`UserAccount/_findUserByEmail`**: This is a tricky one. You might think, "Maybe I want to check if a user exists." However, exposing this publicly creates a **user enumeration vulnerability**. Malicious actors could use this endpoint to figure out which email addresses are registered on your service. It is much safer to keep this excluded and only use it internally via syncs (e.g., as part of an authorized "share with a friend" feature).
* **Other `UserAccount` actions (`updateProfile`, `deleteAccount`, `_getUserProfile`):** No. These are clearly actions that must be performed by the logged-in owner of the account.

**Conclusion:** Based on a secure and common application design, only `register` is a good candidate for inclusion. Everything else either requires coordination between concepts (like `login`) or needs an authorization check to ensure the request is being made by the correct, authenticated user.

Here is the revised and final configuration

```typescript
/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * * inclusions: those that you can justify their inclusion
 * * exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 */
export const inclusions: Record<string, string> = {
  // UserAccount.register is a standalone, public action for new users to create an account.
  // This assumes a user flow where registration is followed by a redirect to a login page,
  // rather than an automatic login.
  "/api/UserAccount/register": "Public action for new users to sign up.",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. This allows
 * synchronizations to handle authentication, authorization, and
 * multi-concept workflows.
 */
export const exclusions: Array<string> = [
  // UserAccount.login MUST be excluded because it requires coordination
  // with the Sessioning concept to create a session token upon successful authentication.
  "/api/UserAccount/login",

  // All other actions below require an active session to authorize the request,
  // which is handled by synchronizations.
  "/api/Focus/setCurrentTask",
  "/api/Focus/clearCurrentTask",
  "/api/Focus/getCurrentTask",

  "/api/Planner/planDay",
  "/api/Planner/replan",
  "/api/Planner/clearDay",
  "/api/Planner/deleteAllForUser",
  "/api/Planner/getNextTask",
  "/api/Planner/_getScheduledTasks",
  "/api/Planner/_scheduleTasks",
  "/api/Planner/_getAvailableSlots",

  "/api/Schedule/blockTime",
  "/api/Schedule/updateSlot",
  "/api/Schedule/deleteSlot",
  "/api/Schedule/syncCalendar",
  "/api/Schedule/deleteAllForUser",
  "/api/Schedule/_getSlots",

  "/api/Sessioning/create",
  "/api/Sessioning/delete",
  "/api/Sessioning/_getUser",

  "/api/Tasks/createUserTasks",
  "/api/Tasks/createTask",
  "/api/Tasks/updateTask",
  "/api/Tasks/reorderTasks",
  "/api/Tasks/markTaskComplete",
  "/api/Tasks/deleteTask",
  "/api/Tasks/deleteAllForUser",
  "/api/Tasks/_getTasks",
  "/api/Tasks/_getRemainingTasks",

  "/api/UserAccount/updateProfile",
  "/api/UserAccount/deleteAccount",
  "/api/UserAccount/_getUserProfile",
  "/api/UserAccount/_findUserByEmail",
];
```
