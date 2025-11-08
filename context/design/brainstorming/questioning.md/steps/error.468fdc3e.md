---
timestamp: 'Fri Nov 07 2025 10:52:34 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_105234.2db0fb86.md]]'
content_id: 468fdc3e13d3ccc8948423b3af383eb2b6ae622568b3e47a81a3df026fa931ac
---

# error: i again got the No overload matches this call.

Overload 1 of 2, '(f: (...args: never\[]) => unknown\[], input: { owner: symbol; }, output: { tasks: symbol; }): Frames<Frame>', gave the following error.\
Argument of type '({ user }: { user: ID; }) => Promise<{ tasks: TaskDocument\[]; } | { error: string; }>' is not assignable to parameter of type '(...args: never\[]) => unknown\[]'.\
Type 'Promise<{ tasks: TaskDocument\[]; } | { error: string; }>' is missing the following properties from type 'unknown\[]': length, pop, push, concat, and 35 more.\
Overload 2 of 2, '(f: (...args: never\[]) => Promise\<unknown\[]>, input: { owner: symbol; }, output: { tasks: symbol; }): Promise\<Frames<Frame>>', gave the following error.\
Argument of type '({ user }: { user: ID; }) => Promise<{ tasks: TaskDocument\[]; } | { error: string; }>' is not assignable to parameter of type '(...args: never\[]) => Promise\<unknown\[]>'.

for the Tasks.\_getTasks and Tasks.\_getRemainingTasks
