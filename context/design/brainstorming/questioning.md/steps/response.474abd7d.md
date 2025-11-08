---
timestamp: 'Fri Nov 07 2025 09:57:40 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_095740.76727c1b.md]]'
content_id: 474abd7d336c6cc9125f81b7319056b3854f49af419b3a43fa30f5c2f6ac1506
---

# response:

Based on the principle of separating public queries from actions that require more complex logic (like authorization or triggering other events), a good approach is to:

1. **Include** simple, non-sensitive read queries (`_` prefixed actions) that a front-end client would need to fetch data.
2. **Exclude** all actions that modify state (write operations) and sensitive queries. These will be handled by synchronizations, giving you a layer to add authorization, logging, or other business logic.

Here is the updated `passthrough.ts` file with these decisions implemented.
