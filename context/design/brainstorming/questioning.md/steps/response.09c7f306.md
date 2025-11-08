---
timestamp: 'Fri Nov 07 2025 13:26:25 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_132625.461868f8.md]]'
content_id: 09c7f30680062c0e3428721cc7e04a50e73e10785463af108b9290512990f966
---

# response:

You are absolutely right to look closely at this, and you've highlighted a critical distinction that my previous blanket statement ("all queries need to be fixed") didn't fully capture. My apologies for the oversimplification.

Let's break down your code, because you're correct: your private helper methods are fine. The issue is only with the **public-facing concept query**.

This is the key difference:

1. **Public Concept Query:** A method whose name starts with `_` and is `public` (or has no access modifier like `private`). These are the *only* methods that can be called from a synchronization's `.query()` function. **These MUST follow the "return-an-array" rule.**
2. **Private Helper Method:** A method marked with the `private` keyword. These are internal implementation details of your concept. They **CANNOT** be called from a sync, and therefore they can have any return type you want. They do not need to follow the "return-an-array" rule.

Now let's analyze your provided code with this rule in mind.

***

### Analysis of Your Code

#### 1. `_getScheduledTasks` - The Public Query (Needs Fixing)

```typescript
// This is PUBLIC because it doesn't say "private"
// The name starts with '_', so it's a Concept Query
async _getScheduledTasks(
  { user }: { user: User },
): Promise<{ tasks: ScheduledTask[] }> { // <-- PROBLEM: Returns Promise<Object>
  // ...
  return { tasks }; // <-- PROBLEM: Returns an object, not an array of objects
}
```

* **Verdict:** This is the method that is causing the `No overload matches this call` error. Because it's a public query, it **must** be changed to return a `Promise<...[]>` to satisfy the synchronization engine.

#### 2. `_scheduleTasks` - The Private Helper (Perfectly Fine)

```typescript
// This is PRIVATE
private async _scheduleTasks( ... ): Promise<{ firstTask?: Task }> {
  // ...
  return { firstTask: ... };
}
```

* **Verdict:** You are 100% correct, this is fine. Because it's `private`, it's just an internal helper function for your concept's logic. The sync engine will never see or call it, so its return type can be whatever you need it to be. **No changes are needed here.**

#### 3. `_getAvailableSlots` - The Private Helper (Perfectly Fine)

```typescript
// This is PRIVATE
private _getAvailableSlots( ... ): BusySlot[] {
  // ...
  return availableSlots;
}
```

* **Verdict:** This is also perfectly fine. It's a private, synchronous helper. **No changes are needed here.**

***

### The Solution

You only need to make a very small change to the one public query, `_getScheduledTasks`. Your internal logic is solid.

Here is the corrected `PlannerConcept.ts` file with the minimal required change, leaving your correct private methods untouched.
