---
timestamp: 'Fri Nov 07 2025 13:45:03 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_134503.2cb45763.md]]'
content_id: 3e1aaf72eeb6595185d1be943a871c55dff658fd260501bacb97ceae717654bd
---

# problem:

The test suite for the `PlannerConcept` is failing after an update that added a new query (`_getScheduledTasks`) and made the `planDay` and `replan` actions more robust by handling date strings.

The primary failure is in "Scenario 1: Replan mid-day," which has become unreliable. The existing tests rely on the `getNextTask` action to verify the state of the planner. This is an indirect and brittle way to test, as a bug in `getNextTask` could mask or cause failures in tests for other actions. The introduction of the `_getScheduledTasks` query provides a much more direct and robust method for asserting the state of the schedule.
