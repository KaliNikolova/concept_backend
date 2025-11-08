---
timestamp: 'Fri Nov 07 2025 18:11:16 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_181116.3a5ae1e9.md]]'
content_id: b62cd2465d94495252b284f6dda09ce93c05bac35387caca75d44185e55d8aa1
---

# file: src/concepts/Requesting/passthrough.ts

```typescript
/**
 * @title Passthrough Configuration
 * @description
 * This file configures which concept actions are exposed directly as API endpoints.
 * By default, all actions are available. To add custom logic like authentication
 * or logging, you must first **exclude** the route here, then create a
 * synchronization to handle the `Requesting.request` action that will be fired
 * instead.
 *
 * - `inclusions`: A map of routes to justifications for why they should be public.
 *   This is useful for public queries that don't require any special handling.
 * - `exclusions`: An array of routes that should be protected or handled by
 *   custom logic. These routes will fire `Requesting.request` actions.
 */

// Add routes here that should be publicly accessible without any checks.
// Format: "route": "justification"
export const inclusions: Record<string, string> = {};

// Add routes here that require custom logic (e.g., authentication, logging).
export const exclusions: string[] = [
  // User Authentication
  "/UserAuthentication/register",
  "/UserAuthentication/login",
  // Session Management
  "/Sessioning/logout",
];
```
