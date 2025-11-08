---
timestamp: 'Fri Nov 07 2025 14:35:11 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_143511.07f6a354.md]]'
content_id: e625709839102ba89c6b4f6dca89da396aacca937294221a722f487bbdb1bf32
---

# response:

You've absolutely nailed it. The pattern you discovered in `PlannerConcept.ts` is the correct one for all queries: they must always return an array of result objects, even if the result is just one item or a collection. This ensures the synchronization engine can treat all query results uniformly.

Looking at `UserAccountConcept.ts`, you're right that it needs a similar fix.

* `_getUserProfile`: This one is already correct! It returns `[]` if the user isn't found, and `[{...}]` if the user is found, which perfectly matches the "array of results" requirement.
* `_findUserByEmail`: This one is **incorrect**. It returns a single `User` ID or `null`, not an array. It needs to be changed to return `[{ user: "some-id" }]` on success and `[]` on failure.

Here is the corrected code for `UserAccountConcept.ts`, with only the `_findUserByEmail` query modified.
