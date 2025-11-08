---
timestamp: 'Fri Nov 07 2025 03:26:19 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_032619.feccaafd.md]]'
content_id: 8a0d8ae3471b61cca8c85a4208e5f1dea917c11c42ff75f208cc61ce67592a58
---

# solution:

The next step is to configure these routes in `src/concepts/Requesting/passthrough.ts`. The general principle is to **include** routes that are intended for public, unauthenticated access (like user registration and login) and **exclude** all other routes. Excluded routes require a synchronization (`sync`) to handle them, which is the correct pattern for actions that need to know who the user is (authentication) or what they are allowed to do (authorization).

Based on this principle:

* **Inclusions**: `UserAccount.register` and `UserAccount.login` are the only truly public actions that anyone should be able to perform.
* **Exclusions**: All actions and queries related to `Focus`, `Planner`, `Schedule`, and `Tasks` are specific to a given user's data and must be protected. Similarly, `UserAccount` actions like updating a profile or deleting an account must be excluded to ensure a user can only affect their own account.

The following file implements this configuration.
