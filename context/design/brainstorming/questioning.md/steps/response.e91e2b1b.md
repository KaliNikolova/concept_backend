---
timestamp: 'Fri Nov 07 2025 10:08:57 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_100857.9a424d59.md]]'
content_id: e91e2b1bc3d9ea660ae00afe84b1a37f8d40627cf508b54afa99cfbcda3d90cc
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

Here is the revised and final configuration that reflects this logic.
