---
timestamp: 'Fri Nov 07 2025 11:06:45 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_110645.f0596b30.md]]'
content_id: 6035760dcd6ad207e6de437f9967d3ffc44a772874b523f11f051f6ef05deaa9
---

# response:

Excellent question. This is a perfect example of a situation where a synchronization is not just for authorization, but for **orchestrating a complex workflow across multiple independent concepts**.

You are right to identify that the `Planner` concept needs information from the `Schedule` concept. The key architectural principle here is **Concept Independence**:

* The `PlannerConcept.ts` file **cannot** `import` or directly call the `ScheduleConcept`. They must remain completely decoupled.
* Therefore, the **synchronization** is the only place where these two concepts can interact. It acts as the "glue" that coordinates them.

The workflow for planning a day will be:

1. A user sends an HTTP request to `/api/Planner/planDay`.
2. The `PlanDayRequest` synchronization catches this.
3. In its `where` clause, the sync **first** queries the `Schedule` concept to get all of the user's already-blocked time slots for that day (`Schedule._getSlots`).
4. Only after it has this information, the `then` clause fires, calling `Planner.planDay` and **passing the list of blocked slots as an argument**.

This way, the `Planner` concept receives all the information it needs to do its job without ever knowing where the schedule data came from. This maintains separation of concerns and makes both concepts more reusable and testable.

Here is the implementation of the `planner.sync.ts` file, demonstrating this orchestration.
