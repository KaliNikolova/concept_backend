---
timestamp: 'Fri Nov 07 2025 13:45:03 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_134503.2cb45763.md]]'
content_id: b292619dc8b7fbc92afaca659ace635e1b8b94b8e0e25fae2746b9e2bf7b01a6
---

# solution:

The `PlannerConcept` implementation is correct. The tests need to be updated to be more robust and to correctly validate the concept's behavior.

The solution involves the following changes to `PlannerConcept.test.ts`:

1. **Fix the Failing Test:** The "Replan mid-day" scenario will be rewritten to use the new `_getScheduledTasks` query. Instead of indirectly checking for tasks with `getNextTask`, it will fetch the entire schedule after the `replan` action and directly assert which tasks are present and which have been correctly removed.
2. **Improve Existing Tests:** Other test scenarios that use `getNextTask` for state verification will also be updated to use `_getScheduledTasks`. This makes the entire test suite more direct, readable, and less coupled to the implementation of other actions.
3. **Add a New Test:** A new scenario will be added to specifically test the functionality and return format of the new `_getScheduledTasks` query, ensuring it works correctly for users with and without scheduled tasks.

These changes will resolve the test failures and result in a more reliable and maintainable test suite for the `PlannerConcept`.
