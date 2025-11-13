# Design Document: The Evolution of "Current"

This document outlines the design journey of "Current," a task management and scheduling application. It traces the project's evolution from the initial concept design in Assignment 2 to the final deployed application, highlighting key changes in concepts, synchronizations, and user interface design.

## 1. From Initial Vision to Final Implementation

The initial problem statement for "Current" focused on solving the paralysis of choice caused by overwhelming to-do lists by providing a single, focused task for the user to work on. While this core mission remained the guiding principle, the application's architecture and user experience evolved significantly.

The final design is a more robust and practical tool. It features a clear separation between task management and daily planning, implemented as two distinct tabs: "My Tasks" and "Day Plan". The application is built on a secure foundation where backend synchronizations control data access and user authentication, a critical shift from the initial, more front-end-driven logic.

## 2. Evolution of the Core Concepts

The initial design was based on five core concepts. While most of these concepts found their way into the final application, their roles and complexity changed to meet practical needs.

### **Stable Foundations: `UserAccount` and `Tasks`**

The `UserAccount` and `Tasks` concepts were implemented largely as specified in the initial design, with some important extensions.

#### **`UserAccount` Concept**

**Assignment 2 Design:**
```
concept UserAccount
  state
    a set of Users with
      an email String
      a passwordHash String
      a displayName String
  actions
    register, login, updateProfile, deleteAccount
```

**Final Implementation:**
- **Core actions preserved**: All four original actions (`register`, `login`, `updateProfile`, `deleteAccount`) were implemented exactly as specified.
- **Key extension**: Added `workingDayStart` and `workingDayEnd` fields to the User state to support the Planner concept's need to know when users are available.
- **New actions**: 
  - `setWorkingHours(user, startTime, endTime)` - Allows users to configure their working hours
  - `getWorkingHours(user)` - Returns the user's working hours (defaults to 09:00-19:00 if not set)
- **Session management**: The concept now works with a separate `Sessioning` concept for session management, rather than handling sessions directly.

#### **`Tasks` Concept**

**Assignment 2 Design:**
```
concept Tasks [User]
  state
    a set of Tasks with
      an owner User
      a description String
      an optional dueDate Date
      an optional estimatedDuration Number
      a status of TODO or DONE
    a UserTasks element with orderedTasks seq of Tasks
```

**Final Implementation:**
- **Core structure preserved**: The concept maintains the same state structure with ordered tasks.
- **Key refinement**: Tasks now have both a `title` (required, short identifier) and an optional `description` (longer details). This separation improves list clarity while still allowing detailed task information.
- **Actions implemented**: All original actions were implemented:
  - `createUserTasks`, `createTask`, `updateTask`, `reorderTasks`
  - `markTaskComplete`, `deleteTask`, `deleteAllForUser`
  - `getTasks`, `getRemainingTasks` (queries)
- **No significant changes**: This concept remained the most stable throughout development.

### **Major Refactoring: The `Schedule` Concept**

The most significant conceptual change occurred in the `Schedule` concept.

**Assignment 2 Design:**
```
concept Schedule [User]
  purpose to represent a user's non-negotiable, externally-scheduled commitments
  principle the schedule is a read-only reflection of a user's external calendar
  state
    a set of BusySlots with
      an owner User
      a startTime DateTime
      a endTime DateTime
  actions
    syncCalendar, deleteAllForUser, blockTime, getSlots
```

**Final Implementation:**
- **Purpose expanded**: The concept now serves a hybrid model combining external calendar data with user-created blocks.
- **Critical addition**: BusySlots now have an `origin` field that distinguishes between:
  - `EXTERNAL`: Slots synced from external calendars (read-only)
  - `MANUAL`: Slots created by the user within the app (editable)
- **New actions**:
  - `updateSlot(slot, newStartTime, newEndTime, newDescription)` - Only works on MANUAL slots
  - `deleteSlot(slot)` - Only works on MANUAL slots
- **Enhanced `syncCalendar`**: Now preserves MANUAL blocks when syncing, preventing user-created blocks (like "Focus Time") from being deleted.
- **Added `description` field**: BusySlots now include a description for better user understanding.

**Why this change was crucial**: Without distinguishing between EXTERNAL and MANUAL slots, syncing the calendar would delete user-created blocks, making the planning feature impractical. This transformation turned `Schedule` from a passive data mirror into an interactive tool.

### **Realization and Refinement: `Planner` and `Focus`**

The `Planner` and `Focus` concepts represent the core user-facing features of the application.

#### **`Planner` Concept**

**Assignment 2 Design:**
```
concept Planner [User, Task]
  actions
    planDay, replan, clearDay, deleteAllForUser, getNextTask
```

**Final Implementation:**
- **Fully realized**: All planned actions were implemented exactly as specified.
- **Key implementation insight**: The planning logic was made time-independent by injecting a `timeProvider` function, ensuring reliable testability.
- **Planning algorithm**: Intelligently fits tasks into available slots based on:
  - Task priority (order in the user's task list)
  - Task duration (estimated time)
  - Available time slots (gaps between busy slots and working hours)
  - Current time (plans from "now" forward, not from midnight)
- **Boundary enforcement**: Added strict checks to prevent scheduling tasks that would start or end outside the planning window (prevents tasks at 11:59 PM bleeding into the next day).

#### **`Focus` Concept**

**Assignment 2 Design:**
```
concept Focus [User, Task]
  purpose to eliminate decision fatigue by presenting the single task a user should be working on right now
  state
    a CurrentTask element of User with a task Task
  actions
    setCurrentTask, clearCurrentTask, getCurrentTask
```

**Final Implementation:**
- **Purpose preserved**: The concept's core purpose remained unchanged.
- **Implementation unchanged**: All three actions were implemented exactly as specified.
- **UI presentation shift**: The *purpose* of the `Focus` concept remained, but its presentation in the UI changed dramatically:
  - **Initial idea**: A persistent, ambient "Current Task" banner always visible at the top of the screen
  - **Final design**: A "Focus" button located within the "Day Plan" view that users click to see their current task
- **Rationale**: This makes "focusing" a more deliberate action that the user initiates after reviewing their generated schedule, creating a more logical and less intrusive user flow.

### **New Concepts: `Sessioning` and `Requesting`**

Two new concepts were added to support secure backend architecture:

#### **`Sessioning` Concept**
- **Purpose**: Manages user sessions and authentication tokens
- **Key action**: `_getUser(session)` - Validates a session token and returns the associated user
- **Why added**: Required for secure API access, allowing the backend to verify user identity before performing actions

#### **`Requesting` Concept**
- **Purpose**: Provides a standardized request/response pattern for API endpoints
- **Key actions**: `request(inputs)`, `respond(request, response)`, `_awaitResponse(request)`
- **Why added**: Enables the synchronization engine to handle HTTP requests and responses in a concept-based way, allowing syncs to intercept and authenticate requests before they reach concept actions

## 3. The Shift in Synchronization Strategy

The role and nature of syncs evolved dramatically from orchestrating application logic to ensuring security and data integrity.

### **Assignment 2 Syncs (Workflow Automation)**

The initial syncs were designed to automate the ideal user workflow:

1. **`initializeUser`**: When a user registers, automatically create their task list

2. **`planAndFocus`**: When viewing the plan, automatically set the first task to focus

3. **`advanceFocus`**: When completing a task, automatically move to the next one

4. **`replanAndFocus`**: When replanning, automatically set the new first task
5. **`deleteUserData`**: When deleting account, clean up all related data
6. **`handleClearDayRequest`**: When clearing the day, also clear focus

### **Final Implementation Syncs (Security & Request Handling)**

The final implementation shifted to a request/response pattern where syncs primarily handle authentication and API routing:

#### **Authentication-First Pattern**

Every user-facing action now follows this pattern:

```typescript
// Request sync: Authenticate and trigger action
export const PlanDayRequest: Sync = ({ request, session, user, tasks, busySlots }) => ({
  when: actions([
    Requesting.request,
    { path: "/Planner/planDay", session, tasks, busySlots },
    { request },
  ]),
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Planner.planDay, { user, tasks, busySlots }]),
});

// Response sync: Return result to client
export const PlanDayResponse: Sync = ({ request, firstTask }) => ({
  when: actions(
    [Requesting.request, { path: "/Planner/planDay" }, { request }],
    [Planner.planDay, {}, { firstTask }],
  ),
  then: actions([Requesting.respond, { request, firstTask }]),
});
```

#### **Key Sync Categories in Final Implementation**

1. **Authentication Syncs** (`auth.sync.ts`):
   - `RegistrationTaskListCreation` - Creates task list on registration (preserved from Assignment 2)
   - `LoginRequest/Response/Error` - Handle login with session creation
   - `LogoutRequest/Response` - Handle logout
   - `GetUserProfile` - Retrieve user profile
   - `SetWorkingHoursRequest/Response` - Set working hours
   - `DeleteAccountRequest` + cleanup syncs - Delete account and all related data

2. **Task Syncs** (`tasks.sync.ts`):
   - All CRUD operations with authentication
   - `MarkCompleteGetNextTask` - When task completed, get next scheduled task
   - `MarkCompleteSetNextFocus` - Automatically set next task as focus (preserves Assignment 2's `advanceFocus` idea)

3. **Planner Syncs** (`planner.sync.ts`):
   - `PlanDayRequest/Response/Error` - Plan day with authentication
   - `PlanDaySetFocus` - Automatically set first task as focus (preserves Assignment 2's `planAndFocus` idea)
   - `ReplanRequest/Response/SetFocus` - Replan with automatic focus
   - `ClearDayRequest/Response` - Clear day
   - `GetNextTaskRequest/Response` - Get next scheduled task

4. **Schedule Syncs** (`schedule.sync.ts`):
   - All CRUD operations with authentication
   - `SyncCalendarRequest/Response` - Sync external calendar

5. **Focus Syncs** (`focus.sync.ts`):
   - `GetCurrentTask` - Get current focus
   - `SetCurrentTaskRequest/Response` - Set focus
   - `ClearCurrentTaskRequest/Response` - Clear focus

#### **What Was Preserved vs. Changed**

**Preserved from Assignment 2:**
- ✅ `initializeUser` → `RegistrationTaskListCreation` (same logic)
- ✅ `planAndFocus` → `PlanDaySetFocus` (automatic focus after planning)
- ✅ `advanceFocus` → `MarkCompleteSetNextFocus` (automatic next task on completion)
- ✅ `replanAndFocus` → `ReplanSetFocus` (automatic focus after replan)
- ✅ `deleteUserData` → Multiple cleanup syncs (same comprehensive cleanup)
- ✅ `handleClearDayRequest` → `ClearDayRequest` + `ClearCurrentTaskRequest` (same logic)

**Changed/Added:**
- 🔄 All syncs now use request/response pattern for security
- ➕ Added error handling syncs for all operations
- ➕ Added authentication checks via `Sessioning._getUser` in `where` clauses
- ➕ Added `Requesting` concept integration for HTTP request handling

**Key Architectural Shift**: Syncs evolved from pure workflow automation to secure API gateways that authenticate requests before allowing concept actions to execute.

## 4. From UI Sketch to Final Application

The visual design and user experience were significantly refined from the initial sketches.

### **Initial Sketch (Assignment 2)**

![sketch](/media/assignment2-sketch.png)

**User Journey (Assignment 2)**: Alex would see her current task immediately upon opening the app, with the ability to view her full list and plan in the same screen.

### **Final UI Design**

The final application uses a clean, tabbed interface that separates concerns:

#### **"My Tasks" Tab**
- **Purpose**: Task capture, organization, and review
- **Features**:
  - "To Do" section with ordered tasks
  - "Archived" section for completed tasks
  - Task creation with title, description, due date, due time, estimated duration
  - Task editing and deletion
  - Task reordering (drag and drop)
  - Task completion (moves to archive)

#### **"Day Plan" Tab**
- **Purpose**: Scheduling, time management, and focus
- **Features**:
  - Visual daily schedule showing:
    - Working hours (configurable)
    - Blocked time slots (manual or external)
    - Scheduled tasks (from Planner)
  - "Block Time" button to manually add busy slots
  - "Set Working Hours" to configure availability
  - "Plan Day" button to generate schedule
  - "Replan" button to regenerate from current time
  - "Clear Day" button to remove all scheduled tasks
  - **"Focus" button** - Shows the current task user should work on (replaces the persistent banner)

### **Key UX Changes**

1. **From Persistent Banner to Deliberate Action**: The "Current Task" is no longer always visible. Instead, users click "Focus" after reviewing their schedule, making it a conscious choice rather than a constant reminder.

2. **From Single Dashboard to Tabbed Interface**: The separation of "My Tasks" and "Day Plan" creates a clearer mental model:
   - **My Tasks** = Planning and organization
   - **Day Plan** = Execution and scheduling

3. **From Automatic to User-Controlled**: Many automatic behaviors (like auto-focus) are now optional or require user action, giving users more control over their workflow.

4. **Enhanced Task Management**: The addition of "due time" (not just date) and better task organization (title vs. description) makes the system more practical for real-world use.

## 5. Implementation Details and Technical Decisions

**Time Handling**: The Planner uses an injectable `timeProvider` function (defaults to current time) to enable time-independent testing with mock providers.

**Boundary Enforcement**: Added strict checks (`plannedStart >= planUntil` and `plannedEnd >= planUntil`) to prevent tasks from being scheduled at 11:59:59.999 PM that would bleed into the next day.

**Optional Return Values**: Changed `planDay` to return `{ firstTask: null }` instead of `undefined` when no tasks can be scheduled, as the sync engine can bind `null` but not `undefined`, preventing request timeouts.

**Schedule Origin Tracking**: The `origin` field (EXTERNAL vs. MANUAL) allows calendar syncs to preserve user-created time blocks while updating external calendar events.

## 6. Conclusion

The core vision of "Current"—to provide clarity and focus for overwhelmed users—remained constant throughout its development. However, the project's design evolved significantly to become more practical, secure, and user-friendly.

### **Key Transformations**

1. **Schedule Concept**: Evolved from read-only calendar mirror to hybrid model supporting both external and manual time blocks
2. **Focus Feature**: Shifted from persistent banner to deliberate button action within Day Plan
3. **Sync Architecture**: Transformed from workflow automation to secure API gateway with authentication
4. **UI Structure**: Moved from single dashboard to tabbed interface with clear separation of concerns
5. **Task Management**: Enhanced with title/description separation and due time support

### **What Stayed True**

- The core problem being solved (decision fatigue and task paralysis)
- The five-concept architecture (UserAccount, Tasks, Schedule, Planner, Focus)
- The automatic focus advancement on task completion
- The automatic focus setting after planning/replanning
- The comprehensive data cleanup on account deletion

The final application successfully translates the initial concept into a well-structured, secure, and deployable tool that maintains the original vision while addressing practical implementation challenges.
