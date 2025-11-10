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
 *   an optional workingDayStart String (HH:MM format)
 *   an optional workingDayEnd String (HH:MM format)
 */
interface UserDoc {
  _id: User;
  email: string;
  passwordHash: string;
  displayName: string;
  workingDayStart?: string;
  workingDayEnd?: string;
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
   * @action setWorkingHours
   * @effects sets the user's working day start and end times
   * @param {Object} args
   * @param {User} args.user - The ID of the user whose working hours are to be set.
   * @param {string} args.startTime - Start time in HH:MM format (e.g., "09:00").
   * @param {string} args.endTime - End time in HH:MM format (e.g., "19:00").
   * @returns {Promise<Empty | { error: string }>} An empty object on success or an error message.
   */
  async setWorkingHours(
    { user, startTime, endTime }: {
      user: User;
      startTime: string;
      endTime: string;
    },
  ): Promise<Empty | { error: string }> {
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return { error: "Invalid time format. Use HH:MM" };
    }

    const result = await this.users.updateOne(
      { _id: user },
      { $set: { workingDayStart: startTime, workingDayEnd: endTime } },
    );

    if (result.matchedCount === 0) {
      return { error: "User not found" };
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
   * @returns {Promise<{ profile: { displayName: string; email: string } }[]>} The user's public profile data in an array, or an empty array if not found.
   */
  async _getUserProfile(
    { user }: { user: User },
  ): Promise<{ profile: { displayName: string; email: string } }[]> {
    const userDoc = await this.users.findOne({ _id: user });
    if (!userDoc) {
      return [];
    }
    return [{
      profile: {
        displayName: userDoc.displayName,
        email: userDoc.email,
      },
    }];
  }

  /**
   * @query _getWorkingHours
   * @effects returns the user's working day hours (start and end times)
   * @param {Object} args
   * @param {User} args.user - The ID of the user.
   * @returns {Promise<{ workingHours: { start: string; end: string } }[]>} The user's working hours in HH:MM format, or defaults (09:00-19:00) if not set.
   */
  async _getWorkingHours(
    { user }: { user: User },
  ): Promise<{ workingHours: { start: string; end: string } }[]> {
    const userDoc = await this.users.findOne({ _id: user });

    if (!userDoc) {
      return [];
    }

    // Return stored values or defaults (9 AM - 7 PM)
    return [{
      workingHours: {
        start: userDoc.workingDayStart || "09:00",
        end: userDoc.workingDayEnd || "19:00",
      },
    }];
  }

  /**
   * @query _findUserByEmail
   * @effects returns the user ID if an email exists.
   * @param {Object} args
   * @param {string} args.email - The email to search for.
   * @returns {Promise<User | null>} The user ID or null if not found.
   */
  async _findUserByEmail(
    { email }: { email: string },
  ): Promise<User | null> {
    const userDoc = await this.users.findOne({ email });
    return userDoc ? userDoc._id : null;
  }
}
