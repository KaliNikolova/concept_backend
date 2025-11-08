---
timestamp: 'Fri Nov 07 2025 10:48:18 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_104818.a1c88348.md]]'
content_id: 6e72b4031a6ac3c2cb273a5db883dc131d885b7e3d51fb49c1255f43964ceeae
---

# response:

You've encountered a classic and very important error when working with concept synchronizations. You are absolutely correct to flag this; the TypeScript error is pointing to a subtle but strict rule in the concept design framework.

The error message is telling you that the return type of `UserAccount._getUserProfile` (`Promise<{...} | null>`) does not match what the `.query()` method in the synchronization engine expects (`Promise<...[]>`).

**The root cause is a core principle of concept queries:**

> **Important:** queries MUST return an **array** of the type specified by the return signature.

This is because the synchronization engine is designed to handle cases where a query might return multiple results (e.g., "get all comments for a post"). Each item in the returned array creates a new "frame" or context for the `then` clause to operate on.

* To indicate a **successful match** that found one item, a query must return an array with one element: `[{...}]`.
* To indicate **no match**, a query must return an empty array: `[]`.

My implementation of `_getUserProfile` and `_findUserByEmail` in `UserAccountConcept.ts` violated this rule by returning a single object or `null`.

Additionally, the return value must be a dictionary whose key matches the output parameter name. For `_getUserProfile`, the sync expects an output parameter named `profile`, so the query must return `[{ profile: {...} }]`.

Here are the corrections for both the concept and the synchronization to fix this error.
