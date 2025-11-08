---
timestamp: 'Fri Nov 07 2025 14:35:11 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_143511.07f6a354.md]]'
content_id: 9674d4ab1d7826bcc2bd6204b0459e83e42da4fbeb1d5da01794aa5285bda321
---

# file: src/concepts/UserAccount/UserAccountConcept.ts

```typescript
// file: src/UserAccount/UserAccountConcept.ts

import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import * as bcrypt from "bcrypt";

/**
 * @concept UserAccount
 * @purpose to securely identify and authenticate users
 * @principle a user must register and log in to be identified
 */
const PREFIX = "UserAccount" + ".";

/**
 * Generic type for User identifiers, treated as opaque IDs.
 */
type User = ID;

/**
 * @state
 * a set of Users with
 *   an email String
 *   a passwordHash String
 *   a displayName String
 */
interface UserDoc {
  _id: User;
  email: string;
  passwordHash: string;
  displayName: string;
}

export default class UserAccountConcept {
  private users: Collection<UserDoc>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  /**
   * @action register
   * @requires email is not already in use
   * @effects creates a new user with the provided details and a hashed password
   * @param {Object} args
   * @param {string} args.email - The unique email address for the user.
   * @param {string} args.password - The plain-text password for the user.
   * @param {string} args.displayName - The display name for the user.
   * @returns {Promise<{ user: User } | { error: string }>} The ID of the new user or an error message.
   */
  async register(
    { email, password, displayName }: {
      email: string;
      password: string;
      displayName: string;
    },
  ): Promise<{ user: User } | { error: string }> {
    const existingUser = await this.users.findOne({ email });
    if (existingUser) {
      return { error: "Email already in use." };
    }

    const passwordHash = await bcrypt.hash(password); // Hash password
    const newUser: UserDoc = {
      _id: freshID(),
      email,
      passwordHash,
      displayName,
    };

    await this.users.insertOne(newUser);
    return { user: newUser._id };
  }

  /**
   * @action login
   * @effects authenticates the user if the email and password match.
   *   (A separate Session concept would typically create a session after successful login)
   * @param {Object} args
   * @param {string} args.email - The user's email address.
   * @param {string} args.password - The user's plain-text password.
   * @returns {Promise<{ user: User } | { error: string }>} The ID of the authenticated user or an error message.
   */
  async login(
    { email, password }: { email: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    const user = await this.users.findOne({ email });
    if (!user) {
      return { error: "Invalid credentials." };
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return { error: "Invalid credentials." };
    }

    return { user: user._id };
  }

  /**
   * @action updateProfile
   * @effects changes the user's displayName
   * @param {Object} args
   * @param {User} args.user - The ID of the user whose profile is to be updated.
   * @param {string} args.newDisplayName - The new display name for the user.
   * @returns {Promise<Empty | { error: string }>} An empty object on success or an error message.
   */
  async updateProfile(
    { user, newDisplayName }: { user: User; newDisplayName: string },
  ): Promise<Empty | { error: string }> {
    const result = await this.users.updateOne(
      { _id: user },
      { $set: { displayName: newDisplayName } },
    );

    if (result.matchedCount === 0) {
      return { error: "User not found." };
    }

    return {};
  }

  /**
   * @action deleteAccount
   * @effects removes the user and all their associated data from this concept's state.
   *   (Any other concepts relying on this user ID would need syncs to handle cascade deletions.)
   * @param {Object} args
   * @param {User} args.user - The ID of the user to be deleted.
   * @returns {Promise<Empty | { error: string }>} An empty object on success or an error message.
   */
  async deleteAccount(
    { user }: { user: User },
  ): Promise<Empty | { error: string }> {
    const result = await this.users.deleteOne({ _id: user });

    if (result.deletedCount === 0) {
      return { error: "User not found." };
    }

    return {};
  }

  /**
   * @query _getUserProfile
   * @effects returns the display name and email of a user.
   * @param {Object} args
   * @param {User} args.user - The ID of the user.
   * @returns {Promise<{ displayName: string; email: string }[]>} The user's public profile data in an array, or an empty array if not found.
   */
  async _getUserProfile(
    { user }: { user: User },
  ): Promise<{ displayName: string; email: string }[]> {
    const userDoc = await this.users.findOne({ _id: user });
    if (!userDoc) {
      return [];
    }
    return [{
      displayName: userDoc.displayName,
      email: userDoc.email,
    }];
  }

  /**
   * @query _findUserByEmail
   * @effects returns the user ID if an email exists.
   * @param {Object} args
   * @param {string} args.email - The email to search for.
   * @returns {Promise<{ user: User }[]>} An array containing the user ID object, or an empty array if not found.
   */
  async _findUserByEmail(
    { email }: { email: string },
  ): Promise<{ user: User }[]> {
    const userDoc = await this.users.findOne({ email }, {
      projection: { _id: 1 },
    });
    if (!userDoc) {
      return [];
    }
    return [{ user: userDoc._id }];
  }
}
```

***

Okay, let's apply the same fix to `TasksConcept.ts`. Both `_getTasks` and `_getRemainingTasks` are returning an error object or a result object, which is incorrect for queries. They should return `[]` for "not found" cases and `[{ tasks: [...] }]` for success cases.

Here is the corrected implementation for `TasksConcept.ts`.
