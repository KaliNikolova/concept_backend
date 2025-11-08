---
timestamp: 'Fri Nov 07 2025 14:43:04 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_144304.358007ea.md]]'
content_id: 3088ff698584a3d486ef0127fd8ad6175e65bd6dd8eda4a0ac6cc4dac3c780ce
---

# response:

That is an absolutely brilliant question. You've cut right to the heart of a subtle but critical design pattern in the framework.

Your intuition is correct from a data purity standpoint: the most direct way to represent "a list of tasks" is as an array `TaskDocument[]`.

However, the reason it's structured as `[{ tasks: TaskDocument[] }]` is because of how the **synchronization engine's `where` clause** is designed to work.

Let's break it down.

### The Key Principle: Queries Enable Variable Binding

When you write a `where` clause in a synchronization, you're not just fetching data; you're **binding that data to variables** for the `then` clause to use.

Consider the query signature from the concept spec:
`_getTasks (user: User): (tasks: seq of TaskDocument)`

And how you would use it in a sync:

```typescript
where: async (frames) => {
    return await frames.query(
        Tasks._getTasks,
        { user },      // Input pattern: use the 'user' variable
        { tasks }      // Output pattern: bind the result to a 'tasks' variable
    );
},
then: actions(
    // Now you can use the 'tasks' variable here
    [Requesting.respond, { request, tasks }] 
)
```

The output pattern `{ tasks }` tells the engine: "Look inside each dictionary returned by the query, find the key named `tasks`, and bind its value to a new variable also named `tasks`."

### Why `TaskDocument[]` Fails

If `_getTasks` returned a plain `TaskDocument[]` like this:
`[ { _id: ..., title: ... }, { _id: ..., title: ... } ]`

...the output pattern `{ tasks }` would fail. The engine would look at the first element, `{ _id: ..., title: ... }`, and see that it doesn't have a key named `"tasks"`. The binding wouldn't work.

### Why `[{ tasks: TaskDocument[] }]` Succeeds

By wrapping the result, we create a structure that the engine can destructure correctly:

1. **Query Result:** `[{ tasks: [ { _id: ... }, { _id: ... } ] }]`
2. **Engine sees:** An array with one dictionary element.
3. **Engine processes the first dictionary:** `{ tasks: [ ... ] }`
4. **Engine looks at the output pattern:** `{ tasks }`
5. **Engine finds a match:** The dictionary has a key named `"tasks"`. It binds the value (the array of actual task documents) to the `tasks` variable in the frame.

This pattern provides a powerful consistency. Consider a different query:

`_getIncompleteTasks(user: User): (task: TaskDocument)`

This query would return an array of *individual* tasks, where each one is wrapped to match the output variable name:
`[ { task: { _id: ... } }, { task: { _id: ... } } ]`

The sync would use it like this: `frames.query(..., { user }, { task })`. The engine would then create a **separate frame for each incomplete task**, allowing you to operate on them one by one in the `then` clause.

**Conclusion:**

You are spot on that it's a "list of json with a list of tasks." While it seems redundant, this wrapping is the essential mechanism that allows the `where` clause to declaratively bind query results—whether it's a single collection or multiple individual items—to variables in a consistent way.

Therefore, the current implementation is correct and necessary for the framework's design. **No changes are needed.**
