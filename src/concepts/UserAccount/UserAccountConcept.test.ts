import { assert, assertEquals, assertExists } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import UserAccountConcept from "./UserAccountConcept.ts";
import { ID } from "@utils/types.ts";

Deno.test("UserAccountConcept", async (t) => {
  const [db, client] = await testDb();
  const userAccount = new UserAccountConcept(db);

  let aliceId: ID; // To store Alice's ID for subsequent tests

  await t.step(
    "Operational Principle: A user can register and then log in",
    async () => {
      // Step 1: Register a new user, fulfilling the first part of the principle.
      const registerInput = {
        email: "alice@example.com",
        password: "password123",
        displayName: "Alice",
      };
      console.log("Action: register", registerInput);
      const registerOutput = await userAccount.register(registerInput);
      console.log("Result:", registerOutput);

      assert(
        !("error" in registerOutput),
        "Registration should not produce an error",
      );
      assertExists(registerOutput.user, "Registration should return a user ID");
      aliceId = registerOutput.user; // Save for later tests

      // Step 2: Log in with the same credentials, fulfilling the second part.
      const loginInput = {
        email: "alice@example.com",
        password: "password123",
      };
      console.log("\nAction: login", loginInput);
      const loginOutput = await userAccount.login(loginInput);
      console.log("Result:", loginOutput);

      assert(!("error" in loginOutput), "Login should not produce an error");
      assertEquals(
        loginOutput.user,
        aliceId,
        "Logged in user ID should match registered user ID",
      );

      // Verification step using a query to confirm state
      const profile = await userAccount._getUserProfile({ user: aliceId });
      assertEquals(profile[0]?.profile.displayName, "Alice");
      assertEquals(profile[0]?.profile.email, "alice@example.com");
    },
  );

  await t.step(
    "Interesting Scenario 1: Attempt to register with a duplicate email",
    async () => {
      const registerInput = {
        email: "alice@example.com", // Same email as the user from the principle test
        password: "anotherPassword",
        displayName: "Bob",
      };
      console.log("\nAction: register (duplicate email)", registerInput);
      const registerOutput = await userAccount.register(registerInput);
      console.log("Result:", registerOutput);

      assert(
        "error" in registerOutput,
        "Registration with duplicate email should produce an error",
      );
      assertEquals(registerOutput.error, "Email already in use.");
    },
  );

  await t.step(
    "Interesting Scenario 2: Attempt to log in with an incorrect password",
    async () => {
      const loginInput = {
        email: "alice@example.com",
        password: "wrongPassword",
      };
      console.log("\nAction: login (incorrect password)", loginInput);
      const loginOutput = await userAccount.login(loginInput);
      console.log("Result:", loginOutput);

      assert(
        "error" in loginOutput,
        "Login with incorrect password should produce an error",
      );
      assertEquals(loginOutput.error, "Invalid credentials.");
    },
  );

  await t.step(
    "Interesting Scenario 3: Successfully update profile, then delete account",
    async () => {
      // Step 1: Update profile
      const updateInput = { user: aliceId, newDisplayName: "Alice Smith" };
      console.log("\nAction: updateProfile", updateInput);
      const updateOutput = await userAccount.updateProfile(updateInput);
      console.log("Result:", updateOutput);

      assert(!("error" in updateOutput), "Profile update should be successful");

      // Verify the update with a query
      const updatedProfile = await userAccount._getUserProfile({
        user: aliceId,
      });
      assertEquals(
        updatedProfile[0]?.profile.displayName,
        "Alice Smith",
        "Display name should be updated",
      );

      // Step 2: Delete account
      const deleteInput = { user: aliceId };
      console.log("\nAction: deleteAccount", deleteInput);
      const deleteOutput = await userAccount.deleteAccount(deleteInput);
      console.log("Result:", deleteOutput);

      assert(
        !("error" in deleteOutput),
        "Account deletion should be successful",
      );

      // Verify deletion by trying to fetch the profile
      const deletedProfile = await userAccount._getUserProfile({
        user: aliceId,
      });
      assertEquals(
        deletedProfile,
        [],
        "Deleted user's profile should not be found",
      );

      // Verify deletion by trying to log in
      const loginInput = {
        email: "alice@example.com",
        password: "password123",
      };
      const loginOutput = await userAccount.login(loginInput);
      assert(
        "error" in loginOutput,
        "Login after account deletion should fail",
      );
    },
  );

  await t.step(
    "Interesting Scenario 4: Attempt to update or delete a non-existent user",
    async () => {
      const fakeUserId = "user:fake" as ID;

      // Step 1: Attempt to update
      const updateInput = { user: fakeUserId, newDisplayName: "Ghost" };
      console.log("\nAction: updateProfile (non-existent user)", updateInput);
      const updateOutput = await userAccount.updateProfile(updateInput);
      console.log("Result:", updateOutput);

      assert(
        "error" in updateOutput,
        "Update on non-existent user should fail",
      );
      assertEquals(updateOutput.error, "User not found.");

      // Step 2: Attempt to delete
      const deleteInput = { user: fakeUserId };
      console.log("\nAction: deleteAccount (non-existent user)", deleteInput);
      const deleteOutput = await userAccount.deleteAccount(deleteInput);
      console.log("Result:", deleteOutput);

      assert(
        "error" in deleteOutput,
        "Delete on non-existent user should fail",
      );
      assertEquals(deleteOutput.error, "User not found.");
    },
  );

  await t.step(
    "Interesting Scenario 5: Working Hours - Set and Get",
    async () => {
      // Register a new user for this test
      const registerResult = await userAccount.register({
        email: "hours@test.com",
        password: "password123",
        displayName: "Hours Tester",
      });
      assert("user" in registerResult);
      const user = registerResult.user;

      // Step 1: Get default working hours (should be 09:00-19:00)
      console.log("\nAction: _getWorkingHours (defaults)");
      const defaultHours = await userAccount._getWorkingHours({ user });
      console.log("Result:", defaultHours);
      assertEquals(
        defaultHours[0]?.workingHours.start,
        "09:00",
        "Default start time should be 09:00",
      );
      assertEquals(
        defaultHours[0]?.workingHours.end,
        "19:00",
        "Default end time should be 19:00",
      );

      // Step 2: Set custom working hours
      const setInput = {
        user,
        startTime: "08:30",
        endTime: "17:30",
      };
      console.log("\nAction: setWorkingHours", setInput);
      const setResult = await userAccount.setWorkingHours(setInput);
      console.log("Result:", setResult);
      assertEquals(setResult, {}, "Setting working hours should succeed");

      // Step 3: Get updated working hours
      console.log("\nAction: _getWorkingHours (after update)");
      const updatedHours = await userAccount._getWorkingHours({ user });
      console.log("Result:", updatedHours);
      assertEquals(
        updatedHours[0]?.workingHours.start,
        "08:30",
        "Start time should be updated to 08:30",
      );
      assertEquals(
        updatedHours[0]?.workingHours.end,
        "17:30",
        "End time should be updated to 17:30",
      );

      // Step 4: Test invalid time format
      const invalidInput = {
        user,
        startTime: "25:00",
        endTime: "17:30",
      };
      console.log("\nAction: setWorkingHours (invalid format)", invalidInput);
      const invalidResult = await userAccount.setWorkingHours(invalidInput);
      console.log("Result:", invalidResult);
      assert(
        "error" in invalidResult,
        "Setting invalid time format should fail",
      );
      assertEquals(
        invalidResult.error,
        "Invalid time format. Use HH:MM",
        "Error message should indicate format issue",
      );
    },
  );

  await client.close();
});
