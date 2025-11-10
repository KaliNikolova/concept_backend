
Overall, the design of the application remained largely stable, with three of the five core concepts being implemented exactly as specified. The most significant design evolution occurred in the Schedule concept, which was refactored from a simple data mirror into a more robust hybrid model. The primary implementation challenge arose in the Planner concept, leading to a key insight about writing testable, time-independent code.

- A key lesson was learning not to blindly trust the LLM's output. It was easy to assume the generated code was perfect, which led to subtle bugs like the time-dependency issue in the Planner. This highlighted the importance of acting as a critical reviewer of AI-generated code, rather than just a prompter.

- I found that asking the LLM to make small, specific changes to existing code was often harder than generating a method from scratch. However, I noticed a significant improvement in this capability when using more advanced models like Gemini 2.5 Pro over Flash, which was better at understanding the context of an existing file and making targeted edits.

- My experience confirmed the course's philosophy on "context engineering." A well-crafted prompt, complete with the concept specification, background documents on coding patterns, and clear instructions, consistently produced high-quality, working code. Vague prompts led to generic and often incorrect results. This iterative process of refining the prompt itself became a core part of my development workflow. For example, I decided to add part of the assignment description for generating test cases.

- Ultimately, I was impressed by the LLM's effectiveness when used within the structured "concept design" framework. By providing the state, actions, and logic in a clear specification, the LLM excelled at translating that design into functional TypeScript. It demonstrated that LLMs are powerful implementation tools when guided by a strong, modular architecture.

### Interesting Moments

1. **Sneaky Time-Dependent Bug:** My Planner tests were failing intermittently, and I realized it was because new Date() made them non-deterministic. This was a critical lesson in writing testable code by isolating external dependencies.
    
    - Finding the bug: [20251031_083755.f7ca65a2](../../context/design/concepts/Planner/testing.md/20251031_083755.f7ca65a2.md)
    - Test output of the working code: [20251031_093109.0c0e3f47](../../context/design/concepts/Planner/testing_results.md/20251031_093109.0c0e3f47.md)
        
2. **Major Refactoring of the Schedule Concept:** The initial Schedule design had a logical flaw where syncing would delete user-created data. The moment I realized this and redesigned it with an origin field was a turning point for the app's usability.
    
    - Old Schedule spec implementation: [20251024_082929.333fd1d4](../../context/design/concepts/Schedule/implementation.md/20251024_082929.333fd1d4.md)
    - New Schedule spec implementation: [20251030_221017.40d42fed](../../context/design/concepts/Schedule/implementation.md/20251030_221017.40d42fed.md)
        
3. **Solving the bcrypt Import Issue:** While not a design change, figuring out the technical issue with the bcrypt library was a moment of practical learning.
    
    - bcrypt used correctly in UserAccount: [20251023_212126.f92eb48b](../../context/design/concepts/UserAccount/implementation.md/20251023_212126.f92eb48b.md)
        
4. **A Perfect Prompt for the Tasks Concept:** After a few tries, the implementation for the Tasks concept was generated almost perfectly. This was surprising given the length of the concept.
    
    - Tasks concept implementation: [20251023_230826.89f97c6f](../../context/design/concepts/Tasks/implementation.md/20251023_230826.89f97c6f.md)
        
5. **Comparing LLM Models for Implementing Code:** Generally Gemini 2.5 pro was better with modifying specific parts of the code and implementations in general - it followed the prompts more closely. For instance, I had to rerun the prompt for implementing UserAccount with Gemini flash but it worked well with pro:
    
    - Working implementation from the first time using Gemini 2.5 pro: [20251021_185449.e6308c8b](../../context/design/concepts/UserAccount/implementation.md/20251021_185449.e6308c8b.md)


# Updates in 4b:

### Planner:

Added `_getScheduledTasks` and tests for it to have access to the current schedule.

### Tasks:

I added task title, taking the function of "description" before. Now description is a more lengthy text used as more extensive explanation of the task.


# Updates in 4c:

Updated all queries to return `Promise<...[]>` for consistency. In particular, I changed:

UserAccount:
 1.  `_getUserProfile`
 2.  `_findUserByEmail`

Tasks:
 1. `_getTasks
 2. `_getRemainingTasks`

Planner:
 1.  `_getScheduledTasks`

Schedule:
 1. `_getSlots`

Focus:
 1. `_getCurrentTask`


#### test results:

```
deno test -A  
running 5 tests from ./src/concepts/Focus/FocusConcept.test.ts
Operational Principle: Set and get a focus task ...
------- output -------
--- TEST: Operational Principle: Set and get a focus task ---
> getCurrentTask({ user: "user:A" })
< []
> setCurrentTask({ user: "user:A", task: "task:1" })
< {}
> getCurrentTask({ user: "user:A" })
< [{"task":"task:1"}]
----- output end -----
Operational Principle: Set and get a focus task ... ok (751ms)
Scenario 1: Clearing a focus task ...
------- output -------

--- TEST: Scenario 1: Clearing a focus task ---
> setCurrentTask({ user: "user:A", task: "task:1" })
< {}
> clearCurrentTask({ user: "user:A" })
< {}
> _getCurrentTask({ user: "user:A" })
< []
----- output end -----
Scenario 1: Clearing a focus task ... ok (640ms)
Scenario 2: Replacing a focus task ...
------- output -------

--- TEST: Scenario 2: Replacing a focus task ---
> setCurrentTask({ user: "user:A", task: "task:1" })
< {}
> setCurrentTask({ user: "user:A", task: "task:2" })
< {}
> _getCurrentTask({ user: "user:A" })
< [{"task":"task:2"}]
----- output end -----
Scenario 2: Replacing a focus task ... ok (663ms)
Scenario 3: Get task for a user with no task ever set ...
------- output -------

--- TEST: Scenario 3: Get task for a user with no task ever set ---
> _getCurrentTask({ user: "user:B" })
< []
----- output end -----
Scenario 3: Get task for a user with no task ever set ... ok (579ms)
Scenario 4: Manage multiple users' focus independently ...
------- output -------

--- TEST: Scenario 4: Manage multiple users' focus independently ---
> setCurrentTask({ user: "user:A", task: "task:1" })
< {}
> setCurrentTask({ user: "user:B", task: "task:2" })
< {}
> _getCurrentTask({ user: "user:A" })
< [{"task":"task:1"}]
> _getCurrentTask({ user: "user:B" })
< [{"task":"task:2"}]
> clearCurrentTask({ user: "user:A" })
< {}
> _getCurrentTask({ user: "user:A" })
< []
> _getCurrentTask({ user: "user:B" })
< [{"task":"task:2"}]
----- output end -----
Scenario 4: Manage multiple users' focus independently ... ok (636ms)
running 5 tests from ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts
Principle: Author creates survey, respondent answers, author views results ... ok (910ms)
Action: createSurvey requires scaleMin < scaleMax ... ok (521ms)
Action: addQuestion requires an existing survey ... ok (491ms)
Action: submitResponse requirements are enforced ... ok (828ms)
Action: updateResponse successfully updates a response and enforces requirements ... ok (896ms)
running 2 tests from ./src/concepts/Planner/PlannerConcept.test.ts
PlannerConcept: Operational Principle ...
------- post-test output -------

--- TRACE: Operational Principle ---
1. Planning day for user 'user:alice' at mock time 9:00:00 AM
 > planDay result: { firstTask: "task:write-report" }
1a. Verifying the full schedule for 'user:alice'.
 > _getScheduledTasks result: [
  {
    tasks: [
      {
        _id: "019a600e-b9e1-7c2b-8f73-7c99990ea76c",
        owner: "user:alice",
        task: "task:write-report",
        plannedStart: 2025-11-07T14:00:00.000Z,
        plannedEnd: 2025-11-07T16:00:00.000Z
      },
      {
        _id: "019a600e-b9e1-70f9-b7f9-ff39c7e16a1b",
        owner: "user:alice",
        task: "task:review-code",
        plannedStart: 2025-11-07T16:00:00.000Z,
        plannedEnd: 2025-11-07T17:30:00.000Z
      },
      {
        _id: "019a600e-b9e1-7783-a180-10a1d6d76ea5",
        owner: "user:alice",
        task: "task:team-meeting-prep",
        plannedStart: 2025-11-07T18:30:00.000Z,
        plannedEnd: 2025-11-07T19:00:00.000Z
      }
    ]
  }
]
2. Getting task after 'task:write-report'.
 > getNextTask result: { nextTask: "task:review-code" }
3. Getting task after 'task:review-code'.
 > getNextTask result: { nextTask: "task:team-meeting-prep" }
4. Getting task after 'task:team-meeting-prep'.
 > getNextTask result: { nextTask: undefined }
----- post-test output end -----
PlannerConcept: Operational Principle ... ok (856ms)
PlannerConcept: Interesting Scenarios ...
  Scenario 1: Replan mid-day after some tasks are done ...
------- post-test output -------

--- SCENARIO: Replan mid-day ---
1. Replanning for user 'user:bob' at mock time 1:00 PM
 > replan result: { firstTask: "task:urgent-fix" }
----- post-test output end -----
  Scenario 1: Replan mid-day after some tasks are done ... ok (132ms)
  Scenario 2: Not enough time left to schedule all tasks ...
------- post-test output -------

--- SCENARIO: Not enough time ---
1. Planning day for 'user:charlie' late in the evening.
----- post-test output end -----
  Scenario 2: Not enough time left to schedule all tasks ... ok (80ms)
  Scenario 3: Clearing and deleting plans ...
------- post-test output -------

--- SCENARIO: Clear and delete ---
----- post-test output end -----
  Scenario 3: Clearing and deleting plans ... ok (179ms)
PlannerConcept: Interesting Scenarios ... ok (903ms)
running 5 tests from ./src/concepts/Schedule/ScheduleConcept.test.ts
Operational Principle: Sync external calendar and manage manual blocks ...
------- post-test output -------

--- Testing Operational Principle ---
Action: syncCalendar for user user:Alice with 2 events
Result: Success
Query: _getSlots for user user:Alice. Found 2 slots.
Action: blockTime for user user:Alice: {
  user: "user:Alice",
  startTime: 2023-10-26T14:00:00.000Z,
  endTime: 2023-10-26T15:00:00.000Z,
  description: "Focus Time"
}
Result: Success, created slot with ID: 019a600e-c52b-71e5-8971-8cbd22d9f27d
Query: _getSlots for user user:Alice. Found 3 slots.
Action: updateSlot for slot 019a600e-c52b-71e5-8971-8cbd22d9f27d: {
  slotId: "019a600e-c52b-71e5-8971-8cbd22d9f27d",
  newStartTime: 2023-10-26T14:30:00.000Z,
  newEndTime: 2023-10-26T15:30:00.000Z,
  newDescription: "Updated Focus Time"
}
Result: Success
Action: syncCalendar for user user:Alice with 1 new event
Result: Success
Query: _getSlots for user user:Alice. Found 2 slots.
--- Operational Principle Test Passed ---
----- post-test output end -----
Operational Principle: Sync external calendar and manage manual blocks ... ok (812ms)        
Interesting Scenario: Attempt to modify external slots ...
------- post-test output -------

--- Testing Scenario: Modify External Slots ---
Action: updateSlot on external slot 019a600e-c7d4-7c5a-bf77-e440684a4eec
Result: Correctly failed with error: "Cannot update a slot with an external origin."
Action: deleteSlot on external slot 019a600e-c7d4-7c5a-bf77-e440684a4eec
Result: Correctly failed with error: "Cannot delete a slot with an external origin."
--- Modify External Slots Test Passed ---
----- post-test output end -----
Interesting Scenario: Attempt to modify external slots ... ok (651ms)
Interesting Scenario: Handle invalid time inputs ...
------- post-test output -------

--- Testing Scenario: Invalid Time Inputs ---
Action: blockTime with startTime > endTime
Result: Correctly failed with error: "Start time must be before end time."
Action: updateSlot with newStartTime === newEndTime
Result: Correctly failed with error: "Start time must be before end time."
--- Invalid Time Inputs Test Passed ---
----- post-test output end -----
Interesting Scenario: Handle invalid time inputs ... ok (537ms)
Interesting Scenario: Complete data removal for a single user ...
------- post-test output -------

--- Testing Scenario: Data Removal ---
Setup: Created 2 slots for David and 1 slot for Eve
Action: deleteAllForUser for user user:David
Result: Success
Query: _getSlots for user user:David. Found 0 slots.
Query: _getSlots for user user:Eve. Found 1 slots.
--- Data Removal Test Passed ---
----- post-test output end -----
Interesting Scenario: Complete data removal for a single user ... ok (702ms)
Interesting Scenario: Syncing with an empty calendar and deleting a manual slot ...
------- post-test output -------

--- Testing Scenario: Empty Sync and Manual Delete ---
Setup: Created one manual and one external slot for Frank.
Action: syncCalendar for user user:Frank with an empty event list
Result: Success
Query: _getSlots for user user:Frank. Found 1 slots.
Action: deleteSlot for manual slot 019a600e-d060-7aff-b72b-bd6bf850e50a
Result: Success
Query: _getSlots for user user:Frank. Found 0 slots.
--- Empty Sync and Manual Delete Test Passed ---
----- post-test output end -----
Interesting Scenario: Syncing with an empty calendar and deleting a manual slot ... ok (1s)  
running 1 test from ./src/concepts/Tasks/TasksConcept.test.ts
TasksConcept ...
  Operational Principle: tasks are added to a prioritized list and can be marked as complete ...
------- post-test output -------

--- TRACE: Operational Principle ---
Action: createUserTasks({ user: "user:Alice" })
Result: {}
Action: createTask({ owner: "user:Alice", title: "Buy milk" })
Result: { task: "019a600e-d839-7208-8127-8b685572ac30" }
Action: createTask({ owner: "user:Alice", title: "Walk the dog" })
Result: { task: "019a600e-d887-7656-856c-3ce185249877" }
Action: createTask({ owner: "user:Alice", title: "File taxes" })
Result: { task: "019a600e-d8c1-7352-842f-907e6563bde4" }
Query: _getTasks({ user: "user:Alice" })
Result: [
  {
    tasks: [
      {
        _id: "019a600e-d839-7208-8127-8b685572ac30",
        owner: "user:Alice",
        title: "Buy milk",
        description: null,
        dueDate: null,
        estimatedDuration: null,
        status: "TODO"
      },
      {
        _id: "019a600e-d887-7656-856c-3ce185249877",
        owner: "user:Alice",
        title: "Walk the dog",
        description: null,
        dueDate: null,
        estimatedDuration: null,
        status: "TODO"
      },
      {
        _id: "019a600e-d8c1-7352-842f-907e6563bde4",
        owner: "user:Alice",
        title: "File taxes",
        description: null,
        dueDate: null,
        estimatedDuration: null,
        status: "TODO"
      }
    ]
  }
]
Action: markTaskComplete({ task: "019a600e-d839-7208-8127-8b685572ac30" })
Result: {}
Query: _getTasks({ user: "user:Alice" }) again
Result: [
  {
    tasks: [
      {
        _id: "019a600e-d839-7208-8127-8b685572ac30",
        owner: "user:Alice",
        title: "Buy milk",
        description: null,
        dueDate: null,
        estimatedDuration: null,
        status: "DONE"
      },
      {
        _id: "019a600e-d887-7656-856c-3ce185249877",
        owner: "user:Alice",
        title: "Walk the dog",
        description: null,
        dueDate: null,
        estimatedDuration: null,
        status: "TODO"
      },
      {
        _id: "019a600e-d8c1-7352-842f-907e6563bde4",
        owner: "user:Alice",
        title: "File taxes",
        description: null,
        dueDate: null,
        estimatedDuration: null,
        status: "TODO"
      }
    ]
  }
]
Query: _getRemainingTasks({ user: "user:Alice" })
Result: [
  {
    tasks: [
      {
        _id: "019a600e-d887-7656-856c-3ce185249877",
        owner: "user:Alice",
        title: "Walk the dog",
        description: null,
        dueDate: null,
        estimatedDuration: null,
        status: "TODO"
      },
      {
        _id: "019a600e-d8c1-7352-842f-907e6563bde4",
        owner: "user:Alice",
        title: "File taxes",
        description: null,
        dueDate: null,
        estimatedDuration: null,
        status: "TODO"
      }
    ]
  }
]
--- END TRACE: Operational Principle ---
----- post-test output end -----
  Operational Principle: tasks are added to a prioritized list and can be marked as complete ... ok (392ms)
  Scenario 1: Reordering and updating tasks ...
------- post-test output -------

--- SCENARIO: Reordering and updating tasks ---
Query: _getTasks for Bob initially
Initial order: [ "Task A", "Task B", "Task C" ]
Action: reorderTasks for Bob with new order [C, A, B]
Result: {}
New order: [ "Task C", "Task A", "Task B" ]
Action: updateTask for 019a600e-da24-7d33-a125-c32e8580a6ab
Result: {}
Updated task details confirmed.
----- post-test output end -----
  Scenario 1: Reordering and updating tasks ... ok (414ms)
  Scenario 2: Deleting tasks ...
------- post-test output -------

--- SCENARIO: Deleting tasks ---
Action: deleteTask 019a600e-db4b-7628-88ec-e6e05b3e8661
Result: {}
Task D deleted successfully.
Action: deleteAllForUser for user:ToDelete
Result: {}
All tasks for user:ToDelete deleted successfully.
----- post-test output end -----
  Scenario 2: Deleting tasks ... ok (320ms)
  Scenario 3: Handling error conditions and requirements ...
------- post-test output -------

--- SCENARIO: Handling error conditions ---
Action: createTask for non-existent user user:Charlie
Result: {
  error: "No task list found for user user:Charlie. Please create one first."
}
Action: createUserTasks for user:Charlie
Result: {}
Action: createUserTasks for user:Charlie AGAIN
Result: { error: "Task list already exists for user user:Charlie" }
Action: updateTask for non-existent task task:fake
Result: { error: "Task task:fake not found." }
Action: reorderTasks for user:Charlie with invalid task ID
Result: {
  error: "New order list does not contain all or only the user's tasks."
}
Action: reorderTasks for user:Charlie with incomplete list
Result: {
  error: "New order list does not contain all or only the user's tasks."
}
----- post-test output end -----
  Scenario 3: Handling error conditions and requirements ... ok (229ms)
  Scenario 4: Querying empty and fully completed lists ...
------- post-test output -------

--- SCENARIO: Querying empty and fully completed lists ---
Action: createUserTasks for user:David
Query: _getTasks on empty list
Query: _getRemainingTasks on empty list
Empty list queries work as expected.
Action: markTaskComplete for both of David's tasks
Query: _getTasks on fully completed list
Query: _getRemainingTasks on fully completed list
Fully completed list queries work as expected.
----- post-test output end -----
  Scenario 4: Querying empty and fully completed lists ... ok (338ms)
TasksConcept ... ok (2s)
running 1 test from ./src/concepts/UserAccount/UserAccountConcept.test.ts
UserAccountConcept ...
  Operational Principle: A user can register and then log in ...
------- post-test output -------
Action: register {
  email: "alice@example.com",
  password: "password123",
  displayName: "Alice"
}
Result: { user: "019a600e-e671-71bc-b329-16a76dbd10c4" }

Action: login { email: "alice@example.com", password: "password123" }
Result: { user: "019a600e-e671-71bc-b329-16a76dbd10c4" }
----- post-test output end -----
  Operational Principle: A user can register and then log in ... ok (473ms)
  Interesting Scenario 1: Attempt to register with a duplicate email ...
------- post-test output -------

Action: register (duplicate email) {
  email: "alice@example.com",
  password: "anotherPassword",
  displayName: "Bob"
}
Result: { error: "Email already in use." }
----- post-test output end -----
  Interesting Scenario 1: Attempt to register with a duplicate email ... ok (19ms)
  Interesting Scenario 2: Attempt to log in with an incorrect password ...
------- post-test output -------

Action: login (incorrect password) { email: "alice@example.com", password: "wrongPassword" } 
Result: { error: "Invalid credentials." }
----- post-test output end -----
  Interesting Scenario 2: Attempt to log in with an incorrect password ... ok (288ms)        
  Interesting Scenario 3: Successfully update profile, then delete account ...
------- post-test output -------

Action: updateProfile {
  user: "019a600e-e671-71bc-b329-16a76dbd10c4",
  newDisplayName: "Alice Smith"
}
Result: {}

Action: deleteAccount { user: "019a600e-e671-71bc-b329-16a76dbd10c4" }
Result: {}
----- post-test output end -----
  Interesting Scenario 3: Successfully update profile, then delete account ... ok (106ms)
  Interesting Scenario 4: Attempt to update or delete a non-existent user ...
------- post-test output -------

Action: updateProfile (non-existent user) { user: "user:fake", newDisplayName: "Ghost" }     
Result: { error: "User not found." }

Action: deleteAccount (non-existent user) { user: "user:fake" }
Result: { error: "User not found." }
----- post-test output end -----
  Interesting Scenario 4: Attempt to update or delete a non-existent user ... ok (40ms)      
UserAccountConcept ... ok (1s)

ok | 19 passed (13 steps) | 0 failed (22s)

PS C:\Users\kalin\OneDrive - Massachusetts Institute of Technology\Uni\Senior\6104\concept_backend>
```






 

#### Other changes:

I added fields for the start and end of the working day to UserAccount:

1. UserDoc Interface (src/concepts/UserAccount/UserAccountConcept.ts)

	- Added workingDayStart?: string and workingDayEnd?: string fields

2. New Actions & Queries

	- setWorkingHours() - Sets user's working hours with HH:MM validation

	- _getWorkingHours() - Returns stored hours or defaults (09:00-19:00)

3. Auth Syncs (src/syncs/auth.sync.ts)

	- SetWorkingHoursRequest - Authenticates and calls action
	
	- SetWorkingHoursResponse - Returns success
	
	- SetWorkingHoursError - Returns validation errors
	
	- GetWorkingHours - Fetches hours for authenticated user

4. API Documentation (design/concepts/API/api_spec.md)

	- /api/UserAccount/setWorkingHours endpoint
	
	- /api/UserAccount/_getWorkingHours endpoint

5. Tests (src/concepts/UserAccount/UserAccountConcept.test.ts)

	- Test for default hours (09:00-19:00)
	
	- Test for setting custom hours
	
	- Test for retrieving updated hours
	
	- Test for invalid time format validation



#### Frontend changes:
Some major frontend changes are that I moved the whole "Focus" functionality as a button within the "Day Plan" window. That way the user can make a schedule and then easily click "Focus" already having an idea of they day plan.
