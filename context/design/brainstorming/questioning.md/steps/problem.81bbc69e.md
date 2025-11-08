---
timestamp: 'Fri Nov 07 2025 03:26:19 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_032619.feccaafd.md]]'
content_id: 81bbc69e08fb2b2bf87b2da2ca90f0a86abbe73c5b2ad7390af1fe6cd05db63a
---

# problem:

After implementing the `Focus` concept and several others (`Planner`, `Schedule`, `Tasks`, `UserAccount`), running the application server shows a long list of `WARNING - UNVERIFIED ROUTE` messages. This indicates that for each new concept action, a decision must be made: should it be a "passthrough" route, accessible directly via the API, or should it be an "excluded" route, which triggers a `Requesting.request` action that can be handled by synchronizations for added logic like authentication or authorization?
