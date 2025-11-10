import { actions, Sync } from "@engine";
import {
  Focus,
  Planner,
  Requesting,
  Schedule,
  Sessioning,
  Tasks,
  UserAccount,
} from "@concepts";

/**
 * =============================================================================
 * REGISTRATION FLOW
 * When a user registers, automatically create their task list.
 * =============================================================================
 */

/**
 * @sync RegistrationTaskListCreation
 * @when a user successfully registers
 * @then create an empty task list for them
 */
export const RegistrationTaskListCreation: Sync = ({ user }) => ({
  when: actions([UserAccount.register, {}, { user }]),
  then: actions([Tasks.createUserTasks, { user }]),
});

/**
 * =============================================================================
 * LOGIN FLOW
 * Login requires coordination between UserAccount and Sessioning concepts.
 * When a user successfully logs in, we create a session and return the token.
 * =============================================================================
 */

/**
 * @sync LoginRequest
 * @when a request is made to login with email and password
 * @then UserAccount.login is called to authenticate the user
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
 * @sync LoginSessionCreation
 * @when UserAccount.login succeeds and returns a user ID
 * @then create a session for that user
 */
export const LoginSessionCreation: Sync = ({ user }) => ({
  when: actions(
    [UserAccount.login, {}, { user }],
  ),
  then: actions([Sessioning.create, { user }]),
});

/**
 * @sync LoginResponse
 * @when a login request leads to successful authentication and session creation
 * @then respond with the session token
 */
export const LoginResponse: Sync = ({ request, user, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/login" }, { request }],
    [UserAccount.login, {}, { user }], // Match successful login (has user)
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

/**
 * @sync LoginError
 * @when UserAccount.login fails
 * @then respond with the error
 */
export const LoginError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/login" }, { request }],
    [UserAccount.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * LOGOUT FLOW
 * Logout requires a valid session token and deletes the session.
 * =============================================================================
 */

/**
 * @sync LogoutRequest
 * @when a request is made to logout with a session token
 * @then delete the session
 */
export const LogoutRequest: Sync = ({ request, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAccount/logout", session },
    { request },
  ]),
  then: actions([Sessioning.delete, { session }]),
});

/**
 * @sync LogoutResponse
 * @when logout request leads to successful session deletion
 * @then respond with success status
 */
export const LogoutResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/logout" }, { request }],
    [Sessioning.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "logged_out" }]),
});

/**
 * @sync LogoutError
 * @when session deletion fails
 * @then respond with the error
 */
export const LogoutError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/logout" }, { request }],
    [Sessioning.delete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * GET USER PROFILE
 * Fetches the current user's profile based on their session.
 * =============================================================================
 */

/**
 * @sync GetUserProfile
 * @when a request is made to get user profile with a session token
 * @where the session is valid and we can retrieve the user's profile
 * @then respond with the profile data
 */
export const GetUserProfile: Sync = (
  { request, session, user, profile },
) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAccount/_getUserProfile", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames; // Unauthorized - request will timeout
    // Query returns an array: [{ displayName, email }]
    return await frames.query(UserAccount._getUserProfile, { user }, { profile });
  },
  then: actions([Requesting.respond, { request, profile }]),
});

/**
 * =============================================================================
 * UPDATE PROFILE
 * Updates the current user's display name based on their session.
 * =============================================================================
 */

/**
 * @sync UpdateProfileRequest
 * @when a request is made to update profile with a session token
 * @where the session is valid
 * @then update the user's profile
 */
export const UpdateProfileRequest: Sync = (
  { request, session, user, newDisplayName },
) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAccount/updateProfile", session, newDisplayName },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions([UserAccount.updateProfile, { user, newDisplayName }]),
});

/**
 * @sync UpdateProfileResponse
 * @when update profile succeeds
 * @then respond with success status
 */
export const UpdateProfileResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/updateProfile" }, { request }],
    [UserAccount.updateProfile, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "profile_updated" }]),
});

/**
 * @sync UpdateProfileError
 * @when update profile fails
 * @then respond with the error
 */
export const UpdateProfileError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/updateProfile" }, { request }],
    [UserAccount.updateProfile, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * SET WORKING HOURS
 * Sets the user's working day hours (start and end times).
 * =============================================================================
 */

/**
 * @sync SetWorkingHoursRequest
 * @when a request is made to set working hours with a session token
 * @where the session is valid
 * @then set the user's working hours
 */
export const SetWorkingHoursRequest: Sync = (
  { request, session, user, startTime, endTime },
) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAccount/setWorkingHours", session, startTime, endTime },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([
    UserAccount.setWorkingHours,
    { user, startTime, endTime },
  ]),
});

/**
 * @sync SetWorkingHoursResponse
 * @when set working hours succeeds
 * @then respond with success status
 */
export const SetWorkingHoursResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/setWorkingHours" }, { request }],
    [UserAccount.setWorkingHours, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

/**
 * @sync SetWorkingHoursError
 * @when set working hours fails
 * @then respond with the error
 */
export const SetWorkingHoursError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/setWorkingHours" }, { request }],
    [UserAccount.setWorkingHours, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * =============================================================================
 * GET WORKING HOURS
 * Fetches the user's working day hours based on their session.
 * =============================================================================
 */

/**
 * @sync GetWorkingHours
 * @when a request is made to get working hours with a session token
 * @where the session is valid and we can retrieve the user's working hours
 * @then respond with the working hours data
 */
export const GetWorkingHours: Sync = (
  { request, session, user, workingHours },
) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAccount/_getWorkingHours", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return frames;
    return await frames.query(
      UserAccount._getWorkingHours,
      { user },
      { workingHours },
    );
  },
  then: actions([Requesting.respond, { request, workingHours }]),
});

/**
 * =============================================================================
 * DELETE ACCOUNT
 * Deletes the user's account and their session. This should cascade to delete
 * all user data from other concepts (handled by separate syncs).
 * =============================================================================
 */

/**
 * @sync DeleteAccountRequest
 * @when a request is made to delete account with a session token
 * @where the session is valid
 * @then delete the user's account
 */
export const DeleteAccountRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAccount/deleteAccount", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions([UserAccount.deleteAccount, { user }]),
});

/**
 * @sync DeleteAccountTasksCleanup
 * @when a user account is successfully deleted
 * @then delete all tasks associated with that user
 */
export const DeleteAccountTasksCleanup: Sync = ({ user }) => ({
  when: actions(
    [UserAccount.deleteAccount, { user }, {}],
  ),
  then: actions([Tasks.deleteAllForUser, { user }]),
});

/**
 * @sync DeleteAccountScheduleCleanup
 * @when a user account is successfully deleted
 * @then delete all schedule slots associated with that user
 */
export const DeleteAccountScheduleCleanup: Sync = ({ user }) => ({
  when: actions(
    [UserAccount.deleteAccount, { user }, {}],
  ),
  then: actions([Schedule.deleteAllForUser, { user }]),
});

/**
 * @sync DeleteAccountPlannerCleanup
 * @when a user account is successfully deleted
 * @then delete all planner data associated with that user
 */
export const DeleteAccountPlannerCleanup: Sync = ({ user }) => ({
  when: actions(
    [UserAccount.deleteAccount, { user }, {}],
  ),
  then: actions([Planner.deleteAllForUser, { user }]),
});

/**
 * @sync DeleteAccountFocusCleanup
 * @when a user account is successfully deleted
 * @then clear the focus task for that user
 */
export const DeleteAccountFocusCleanup: Sync = ({ user }) => ({
  when: actions(
    [UserAccount.deleteAccount, { user }, {}],
  ),
  then: actions([Focus.clearCurrentTask, { user }]),
});

/**
 * @sync DeleteAccountSessionCleanup
 * @when a user account is successfully deleted from a request with a session
 * @then delete that session
 */
export const DeleteAccountSessionCleanup: Sync = ({ session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/deleteAccount", session }, {}],
    [UserAccount.deleteAccount, {}, {}],
  ),
  then: actions([Sessioning.delete, { session }]),
});

/**
 * @sync DeleteAccountResponse
 * @when delete account succeeds
 * @then respond with success status
 */
export const DeleteAccountResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/deleteAccount" }, { request }],
    [UserAccount.deleteAccount, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "account_deleted" }]),
});

/**
 * @sync DeleteAccountError
 * @when delete account fails
 * @then respond with the error
 */
export const DeleteAccountError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAccount/deleteAccount" }, { request }],
    [UserAccount.deleteAccount, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
