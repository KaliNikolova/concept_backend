---
timestamp: 'Fri Nov 07 2025 03:25:43 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_032543.de0cf37e.md]]'
content_id: a13a2d1411d9a2a0778d7ae8159f4184bd7abd527443f0c1a26e5fe36e38369d
---

# concept: Focus

```
concept Focus [User, Task]
  purpose to eliminate decision fatigue by presenting the single task a user should be working on right now
  principle it presents the currently scheduled task to the user, providing a single point of focus
  state
    a CurrentTask element of User with
      a task Task
  actions
    setCurrentTask (user: User, task: Task)
      effect sets the specified task as the user's current focus
    clearCurrentTask (user: User)
      effect removes the current task for the user
    getCurrentTask (user: User): (task: optional Task)
      effect returns the user's current task, if any
```
