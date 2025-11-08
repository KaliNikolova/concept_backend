---
timestamp: 'Fri Nov 07 2025 14:26:46 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_142646.d00c680d.md]]'
content_id: e3ce4c9911cf882143b40c433c1f77194feb3ded136fc19f84c2a9a7d3b4cb8f
---

# response:

Of course. You've correctly identified the required pattern for query return types. Queries must always return a `Promise` that resolves to an `Array` of objects, even if there's only one or zero results. This ensures the synchronization engine can handle them consistently.

Looking at `UserAccountConcept.ts`, here's the breakdown:

* `_getUserProfile`: This query is **already correct**. It returns `Promise<{ displayName: string; email: string }[]>`, which is an array of objects. No changes are needed here.
* `_findUserByEmail`: This query is **incorrect**. It currently returns `Promise<User | null>`. It needs to be changed to return `Promise<{ user: User }[]>`.

Here is the corrected implementation for `UserAccountConcept.ts`, with only the `_findUserByEmail` query and its documentation updated.
