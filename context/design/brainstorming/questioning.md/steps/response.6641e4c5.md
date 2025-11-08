---
timestamp: 'Fri Nov 07 2025 14:28:54 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_142854.b55f0ba4.md]]'
content_id: 6641e4c5d8433a54c930d27f86e924cab9c5e5c87d0e8cbccad0067edcbaddd6
---

# response:

Of course. Let's get the `Tasks` concept fixed.

You are correct that the query return format needs to be consistent. Following the pattern from `PlannerConcept.ts`, I've identified that the queries in the `Tasks` concept, `_getTasks` and `_getRemainingTasks`, need to be updated.

The issue is that queries returning a list of items should wrap that list inside an object, which itself is then wrapped in an array. For example, instead of just returning an array of tasks, a query named `_getTasks` should return a `Promise<{ tasks: TaskDoc[] }[]>`. This consistent structure is what the synchronization engine expects to work with.

Here is the complete and corrected implementation for `TasksConcept.ts`.
