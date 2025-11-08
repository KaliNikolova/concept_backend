---
timestamp: 'Fri Nov 07 2025 04:19:30 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_041930.c7002d0b.md]]'
content_id: b4c89f741160fe35037a4df1d60948e69e48fc949e495bbc6ed287bc69b468d3
---

# response:

Of course. After excluding routes from passthrough, the next step is to create synchronizations (`syncs`) to handle them. These syncs will re-implement the original behavior but add a crucial layer for authentication and authorization.

For every excluded route, we will create a pair of syncs:

1. **Request Sync**: This sync triggers on a `Requesting.request` action. It authenticates the user by verifying their session and, if successful, calls the intended concept action.
2. **Response Sync**: This sync triggers when the concept action completes. It takes the result of that action and sends it back to the original requester using `Requesting.respond`.

All of the following synchronizations assume the existence of a `Sessioning` concept that can validate a `session` ID and map it to a `user` ID. This is a standard pattern for secure applications.

Here is the implementation of the required syncs in a new file.
