---
timestamp: 'Fri Nov 07 2025 13:07:56 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_130756.6beab854.md]]'
content_id: e0df3bddb8a06bf7a3e89624b473e301bacc01ea1d16e370fa472df5876c1028
---

# response:

That's an excellent and very important question. The short answer is: **Yes, absolutely.**

You've hit on the fundamental rule for all queries in this concept design framework, and it's crucial to internalize it to avoid these specific TypeScript errors.

Let's break down *why* this rule is so important, because it's not arbitrary—it's central to how synchronizations work.

### The Core Principle: Queries Must Support Iteration

Think about a query like `Comment._getCommentsForPost`. It could find one comment, ten comments, or zero comments. The synchronization engine needs a consistent way to handle all three possibilities. The **array** is the perfect solution:

* **No Results:** If the query finds nothing, it returns an empty array `[]`. The `where` clause receives this, the number of frames becomes zero, and the sync correctly stops.
* **One Result:** If the query finds one item, it returns an array with that single item, like `[{ comment: ... }]`. The `where` clause receives one frame, and the `then` clause runs once.
* **Multiple Results:** If the query finds ten comments, it returns an array with all ten, like `[{ comment: c1 }, { comment: c2 }, ...]`. The `where` clause now has ten frames, and the `then` clause **runs ten times**, once for each comment.

This is how the framework gets iteration "for free". **Therefore, every query must return a `Promise<...[]>` to support this universal pattern, even if you know it will only ever find one or zero results.**

### Your Action Plan: A Quick Audit

You need to go through each of your concept files and ensure every method that starts with an underscore `_` (a query) has a return signature of `Promise<...[]>` and implements it correctly.

Let's do a quick audit:

1. **`UserAccountConcept.ts`**: We already fixed `_getUserProfile` and `_findUserByEmail`. (**Done**)
2. **`TasksConcept.ts`**: We already fixed `_getTasks` and `_getRemainingTasks`. (**Done**)
3. **`PlannerConcept.ts`**: We already fixed `_getScheduledTasks`. (**Done**)
4. **`ScheduleConcept.ts`**: This one still needs to be fixed. The `_getSlots` query is almost certainly returning a single object or null instead of an array.

To save you the next step and complete the process, here is the corrected implementation for `ScheduleConcept.ts`. It has the exact same fix applied to its `_getSlots` query.
