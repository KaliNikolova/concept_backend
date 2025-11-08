---
timestamp: 'Fri Nov 07 2025 18:26:22 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_182622.39a70e53.md]]'
content_id: 0f8ff852c03627bbeb0414179c7105440ddf866c56d7fb25ceb31c221f5d7204
---

# response:

Here are the implementations for the authentication synchronizations. These files should be placed in a new `src/syncs/auth/` directory.

### 1. Login Synchronization

This sync handles the `/api/UserAccount/login` route. It takes an email and password, attempts to log the user in, creates a session upon success, and responds with either a session token or an error.

**File: `src/syncs/auth/login.sync.ts`**

```typescript
import { sync } from "@gateway/index.ts";
import { Requesting, Sessioning, UserAccount } from "@concepts/index.ts";

/**
 * This sync handles the entire user login flow.
 * 1. Listens for a POST request to `/api/UserAccount/login`.
 * 2. Calls `UserAccount.login` to verify credentials.
 * 3. On successful login, calls `Sessioning.create` to generate a session token.
 * 4. Responds to the original request with the session token or an error message.
 */
export default sync({
  name: "User Login",
  when: {
    // Trigger when a request is made to the login endpoint.
    request: Requesting.request({
      path: "/UserAccount/login",
    }),
  },
  then: async ({ request }) => {
    // The request body is in the `input` field of the request document.
    const { email, password } = request.input;

    if (!email || !password) {
      await Requesting.respond({
        request: request._id,
        error: "Email and password are required.",
      });
      return;
    }

    // Attempt to authenticate the user.
    const loginResult = await UserAccount.login({ email, password });

    // The login action returns either { user: ID } or { error: string }.
    if ("user" in loginResult) {
      // On success, create a session for the authenticated user.
      const { session } = await Sessioning.create({ user: loginResult.user });

      // Respond with the new session ID.
      await Requesting.respond({ request: request._id, session });
    } else {
      // On failure, respond with the error from the login action.
      await Requesting.respond({
        request: request._id,
        error: loginResult.error,
      });
    }
  },
});
```

### 2. Logout Synchronization

This sync handles the `/api/Sessioning/delete` route. It takes a session ID and deletes it, effectively logging the user out.

**File: `src/syncs/auth/logout.sync.ts`**

```typescript
import { sync } from "@gateway/index.ts";
import { Requesting, Sessioning } from "@concepts/index.ts";

/**
 * This sync handles user logout.
 * 1. Listens for a POST request to `/api/Sessioning/delete`.
 * 2. Extracts the session ID from the request body.
 * 3. Calls `Sessioning.delete` to invalidate the session.
 * 4. Responds with a confirmation message.
 */
export default sync({
  name: "User Logout",
  when: {
    request: Requesting.request({
      path: "/Sessioning/delete",
    }),
  },
  then: async ({ request }) => {
    const { session } = request.input;

    if (!session) {
      await Requesting.respond({
        request: request._id,
        error: "Session ID is required.",
      });
      return;
    }

    // Attempt to delete the session. The `delete` action handles
    // cases where the session doesn't exist.
    await Sessioning.delete({ session });

    // Respond to the client to confirm logout.
    await Requesting.respond({ request: request._id, status: "logged_out" });
  },
});
```

### 3. Authenticated Routes Synchronizations

This file contains the logic for all other protected routes. It uses a helper function, `withAuth`, to first verify the provided session token and retrieve the associated user ID before proceeding to call the intended concept action.

**File: `src/syncs/auth/authenticatedRoutes.sync.ts`**

```typescript
import { sync } from "@gateway/index.ts";
import {
  Focus,
  Planner,
  Requesting,
  Schedule,
  Sessioning,
  Tasks,
  UserAccount,
} from "@concepts/index.ts";

/**
 * A higher-order function that wraps a sync's `then` clause with
 * session validation logic.
 *
 * @param handler The original `then` function to execute upon successful authentication.
 * @returns An async function that performs session validation and then calls the handler.
 */
const withAuth = (
  handler: (args: {
    request: any;
    user: string;
    params: Record<string, any>;
  }) => Promise<void>,
) => {
  return async ({ request }: { request: any }) => {
    const { session, ...params } = request.input;

    if (!session) {
      return await Requesting.respond({
        request: request._id,
        error: "Unauthorized: Missing session token.",
      });
    }

    const userResult = await Sessioning._getUser({ session });

    if (userResult.length === 0 || "error" in userResult[0]) {
      const error = userResult[0]?.error ?? "Invalid session.";
      return await Requesting.respond({
        request: request._id,
        error: `Unauthorized: ${error}`,
      });
    }

    const { user } = userResult[0];
    await handler({ request, user, params });
  };
};

// --- Syncs for Focus Concept ---
export const setCurrentTask = sync({
  name: "Authenticated: Focus.setCurrentTask",
  when: { request: Requesting.request({ path: "/Focus/setCurrentTask" }) },
  then: withAuth(async ({ request, user, params }) => {
    const result = await Focus.setCurrentTask({ user, ...params });
    await Requesting.respond({ request: request._id, ...result });
  }),
});

export const clearCurrentTask = sync({
  name: "Authenticated: Focus.clearCurrentTask",
  when: { request: Requesting.request({ path: "/Focus/clearCurrentTask" }) },
  then: withAuth(async ({ request, user, params }) => {
    const result = await Focus.clearCurrentTask({ user, ...params });
    await Requesting.respond({ request: request._id, ...result });
  }),
});

export const getCurrentTask = sync({
  name: "Authenticated: Focus._getCurrentTask",
  when: { request: Requesting.request({ path: "/Focus/getCurrentTask" }) },
  then: withAuth(async ({ request, user }) => {
    const result = await Focus._getCurrentTask({ user });
    await Requesting.respond({ request: request._id, currentTask: result[0] ?? null });
  }),
});

// --- Syncs for Planner Concept ---
export const planDay = sync({
  name: "Authenticated: Planner.planDay",
  when: { request: Requesting.request({ path: "/Planner/planDay" }) },
  then: withAuth(async ({ request, user, params }) => {
    const result = await Planner.planDay({ user, ...params });
    await Requesting.respond({ request: request._id, ...result });
  }),
});

export const replan = sync({
  name: "Authenticated: Planner.replan",
  when: { request: Requesting.request({ path: "/Planner/replan" }) },
  then: withAuth(async ({ request, user, params }) => {
    const result = await Planner.replan({ user, ...params });
    await Requesting.respond({ request: request._id, ...result });
  }),
});

export const clearDay = sync({
  name: "Authenticated: Planner.clearDay",
  when: { request: Requesting.request({ path: "/Planner/clearDay" }) },
  then: withAuth(async ({ request, user, params }) => {
    const result = await Planner.clearDay({ user, ...params });
    await Requesting.respond({ request: request._id, ...result });
  }),
});

export const deleteAllForUserPlanner = sync({
    name: "Authenticated: Planner.deleteAllForUser",
    when: { request: Requesting.request({ path: "/Planner/deleteAllForUser" }) },
    then: withAuth(async ({ request, user }) => {
        const result = await Planner.deleteAllForUser({ user });
        await Requesting.respond({ request: request._id, ...result });
    }),
});

export const getNextTask = sync({
    name: "Authenticated: Planner.getNextTask",
    when: { request: Requesting.request({ path: "/Planner/getNextTask" }) },
    then: withAuth(async ({ request, user, params }) => {
        const result = await Planner.getNextTask({ user, ...params });
        await Requesting.respond({ request: request._id, ...result });
    }),
});

export const getScheduledTasks = sync({
    name: "Authenticated: Planner._getScheduledTasks",
    when: { request: Requesting.request({ path: "/Planner/_getScheduledTasks" }) },
    then: withAuth(async ({ request, user }) => {
        const result = await Planner._getScheduledTasks({ user });
        await Requesting.respond({ request: request._id, ...(result[0] ?? { tasks: [] }) });
    }),
});

// --- Syncs for Schedule Concept ---
export const blockTime = sync({
  name: "Authenticated: Schedule.blockTime",
  when: { request: Requesting.request({ path: "/Schedule/blockTime" }) },
  then: withAuth(async ({ request, user, params }) => {
    const result = await Schedule.blockTime({ user, ...params });
    await Requesting.respond({ request: request._id, ...result });
  }),
});

export const updateSlot = sync({
  name: "Authenticated: Schedule.updateSlot",
  when: { request: Requesting.request({ path: "/Schedule/updateSlot" }) },
  then: withAuth(async ({ request, params }) => { // Note: `updateSlot` doesn't require user ID
    const result = await Schedule.updateSlot({ ...params });
    await Requesting.respond({ request: request._id, ...result });
  }),
});

export const deleteSlot = sync({
  name: "Authenticated: Schedule.deleteSlot",
  when: { request: Requesting.request({ path: "/Schedule/deleteSlot" }) },
  then: withAuth(async ({ request, params }) => { // Note: `deleteSlot` doesn't require user ID
    const result = await Schedule.deleteSlot({ ...params });
    await Requesting.respond({ request: request._id, ...result });
  }),
});

export const syncCalendar = sync({
    name: "Authenticated: Schedule.syncCalendar",
    when: { request: Requesting.request({ path: "/Schedule/syncCalendar" }) },
    then: withAuth(async ({ request, user, params }) => {
        const result = await Schedule.syncCalendar({ user, ...params });
        await Requesting.respond({ request: request._id, ...result });
    }),
});

export const deleteAllForUserSchedule = sync({
    name: "Authenticated: Schedule.deleteAllForUser",
    when: { request: Requesting.request({ path: "/Schedule/deleteAllForUser" }) },
    then: withAuth(async ({ request, user }) => {
        const result = await Schedule.deleteAllForUser({ user });
        await Requesting.respond({ request: request._id, ...result });
    }),
});

export const getSlots = sync({
    name: "Authenticated: Schedule._getSlots",
    when: { request: Requesting.request({ path: "/Schedule/_getSlots" }) },
    then: withAuth(async ({ request, user }) => {
        const result = await Schedule._getSlots({ user });
        const slots = result.map(item => item.slot);
        await Requesting.respond({ request: request._id, slots });
    }),
});

// --- Syncs for Tasks Concept ---
export const createTask = sync({
  name: "Authenticated: Tasks.createTask",
  when: { request: Requesting.request({ path: "/Tasks/createTask" }) },
  then: withAuth(async ({ request, user, params }) => {
    const result = await Tasks.createTask({ owner: user, ...params });
    await Requesting.respond({ request: request._id, ...result });
  }),
});

export const getTasks = sync({
  name: "Authenticated: Tasks._getTasks",
  when: { request: Requesting.request({ path: "/Tasks/_getTasks" }) },
  then: withAuth(async ({ request, user }) => {
    const result = await Tasks._getTasks({ user });
    await Requesting.respond({ request: request._id, ...(result[0] ?? { tasks: [] }) });
  }),
});

export const updateTask = sync({
    name: "Authenticated: Tasks.updateTask",
    when: { request: Requesting.request({ path: "/Tasks/updateTask" }) },
    then: withAuth(async ({ request, params }) => {
        // Security Note: This action should ideally verify task ownership.
        const result = await Tasks.updateTask({ ...params });
        await Requesting.respond({ request: request._id, ...result });
    }),
});

export const reorderTasks = sync({
    name: "Authenticated: Tasks.reorderTasks",
    when: { request: Requesting.request({ path: "/Tasks/reorderTasks" }) },
    then: withAuth(async ({ request, user, params }) => {
        const result = await Tasks.reorderTasks({ user, ...params });
        await Requesting.respond({ request: request._id, ...result });
    }),
});

export const markTaskComplete = sync({
    name: "Authenticated: Tasks.markTaskComplete",
    when: { request: Requesting.request({ path: "/Tasks/markTaskComplete" }) },
    then: withAuth(async ({ request, params }) => {
        const result = await Tasks.markTaskComplete({ ...params });
        await Requesting.respond({ request: request._id, ...result });
    }),
});

export const deleteTask = sync({
    name: "Authenticated: Tasks.deleteTask",
    when: { request: Requesting.request({ path: "/Tasks/deleteTask" }) },
    then: withAuth(async ({ request, params }) => {
        const result = await Tasks.deleteTask({ ...params });
        await Requesting.respond({ request: request._id, ...result });
    }),
});

export const deleteAllForUserTasks = sync({
    name: "Authenticated: Tasks.deleteAllForUser",
    when: { request: Requesting.request({ path: "/Tasks/deleteAllForUser" }) },
    then: withAuth(async ({ request, user }) => {
        const result = await Tasks.deleteAllForUser({ user });
        await Requesting.respond({ request: request._id, ...result });
    }),
});

export const getRemainingTasks = sync({
    name: "Authenticated: Tasks._getRemainingTasks",
    when: { request: Requesting.request({ path: "/Tasks/_getRemainingTasks" }) },
    then: withAuth(async ({ request, user }) => {
        const result = await Tasks._getRemainingTasks({ user });
        await Requesting.respond({ request: request._id, ...(result[0] ?? { tasks: [] }) });
    }),
});


// --- Syncs for UserAccount Concept ---
export const updateProfile = sync({
  name: "Authenticated: UserAccount.updateProfile",
  when: { request: Requesting.request({ path: "/UserAccount/updateProfile" }) },
  then: withAuth(async ({ request, user, params }) => {
    const result = await UserAccount.updateProfile({ user, ...params });
    await Requesting.respond({ request: request._id, ...result });
  }),
});

export const deleteAccount = sync({
    name: "Authenticated: UserAccount.deleteAccount",
    when: { request: Requesting.request({ path: "/UserAccount/deleteAccount" }) },
    then: withAuth(async ({ request, user }) => {
        const result = await UserAccount.deleteAccount({ user });
        await Requesting.respond({ request: request._id, ...result });
    }),
});

export const getUserProfile = sync({
    name: "Authenticated: UserAccount._getUserProfile",
    when: { request: Requesting.request({ path: "/UserAccount/_getUserProfile" }) },
    then: withAuth(async ({ request, user }) => {
        const result = await UserAccount._getUserProfile({ user });
        await Requesting.respond({ request: request._id, ...(result[0] ?? null) });
    }),
});
```

*Note: A few protected routes like `Schedule.updateSlot` and `Tasks.updateTask` do not accept a `user` ID in their signature. This is a potential security issue in the concept's design, as ownership cannot be verified. The syncs above call them as designed, but in a real-world scenario, the concept actions should be updated to enforce authorization.*
