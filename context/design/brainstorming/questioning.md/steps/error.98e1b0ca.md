---
timestamp: 'Fri Nov 07 2025 10:47:29 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_104729.dbdcb8ed.md]]'
content_id: 98e1b0ca1a3a12774e9835ee89dc7cf4df57e81eef4bd81a03a5a499fabdca62
---

# error: im getting the following error when UserAccount.\_getUserProfile

No overload matches this call.\
Overload 1 of 2, '(f: (...args: never\[]) => unknown\[], input: { user: symbol; }, output: { profile: symbol; }): Frames<Frame>', gave the following error.\
Argument of type '({ user }: { user: ID; }) => Promise<{ displayName: string; email: string; } | null>' is not assignable to parameter of type '(...args: never\[]) => unknown\[]'.\
Type 'Promise<{ displayName: string; email: string; } | null>' is missing the following properties from type 'unknown\[]': length, pop, push, concat, and 35 more.\
Overload 2 of 2, '(f: (...args: never\[]) => Promise\<unknown\[]>, input: { user: symbol; }, output: { profile: symbol; }): Promise\<Frames<Frame>>', gave the following error.\
Argument of type '({ user }: { user: ID; }) => Promise<{ displayName: string; email: string; } | null>' is not assignable to parameter of type '(...args: never\[]) => Promise\<unknown\[]>'
