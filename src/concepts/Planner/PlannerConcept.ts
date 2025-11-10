import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Generic parameters for the Planner concept
type User = ID;
type Task = ID;

// Supporting types for actions
type DateTime = Date;

/**
 * Represents a block of time that is unavailable for scheduling.
 */
interface BusySlot {
  start: DateTime;
  end: DateTime;
}

/**
 * Represents a task with its required duration in minutes.
 * This is necessary for the planner to know how much time to allocate.
 */
interface TaskWithDuration {
  id: Task;
  duration: number; // in minutes
}

/**
 * State: A set of ScheduledTasks with an owner, a task, and a planned time window.
 * This represents a task that has been placed onto the user's schedule.
 */
interface ScheduledTask {
  _id: ID;
  owner: User;
  task: Task;
  plannedStart: DateTime;
  plannedEnd: DateTime;
}

const PREFIX = "Planner.";

/**
 * concept: Planner
 * purpose: having a realistic, time-based plan for a user's tasks
 */
export default class PlannerConcept {
  private readonly scheduledTasks: Collection<ScheduledTask>;
  // Dependency for providing the current time. Makes the concept testable.
  private readonly timeProvider: () => Date;

  constructor(db: Db, timeProvider: () => Date = () => new Date()) {
    this.scheduledTasks = db.collection<ScheduledTask>(
      PREFIX + "scheduledTasks",
    );
    this.timeProvider = timeProvider;
  }

  /**
   * Schedules a user's tasks for a full day.
   * effect: creates a new, full-day schedule by assigning tasks to available time slots; returns the first task, if any.
   * This action first clears the user's existing schedule for the day before planning.
   */
  async planDay(
    { user, tasks, busySlots }: {
      user: User;
      tasks: TaskWithDuration[];
      busySlots: BusySlot[];
    },
  ): Promise<{ firstTask?: Task } | { error: string }> {
    // Convert ISO strings to Date objects (in case they came from JSON)
    const busySlotsWithDates = busySlots.map((slot) => ({
      start: new Date(slot.start),
      end: new Date(slot.end),
    }));

    // Use the earliest busy slot or current time to determine the planning window
    const now = this.timeProvider();

    // If we have busy slots, use them to infer the planning day
    // Otherwise fall back to server's current day
    let planningDay = now;
    if (busySlotsWithDates.length > 0) {
      // Use the date from the first busy slot as the planning reference
      const firstSlotDate = busySlotsWithDates[0].start;
      planningDay = firstSlotDate;
    }

    const startOfDay = new Date(
      planningDay.getFullYear(),
      planningDay.getMonth(),
      planningDay.getDate(),
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      planningDay.getFullYear(),
      planningDay.getMonth(),
      planningDay.getDate(),
      23,
      59,
      59,
    );

    // Clear ALL scheduled tasks for the user (to avoid timezone confusion)
    console.log(
      `[Planner] Clearing ALL scheduled tasks for user before planning`,
    );
    const deleteResult = await this.scheduledTasks.deleteMany({
      owner: user,
    });
    console.log(
      `[Planner] Deleted ${deleteResult.deletedCount} existing scheduled tasks`,
    );

    // Plan from now if it's within the planning day, otherwise from start of day
    const planFrom = (now >= startOfDay && now < endOfDay) ? now : startOfDay;

    if (planFrom >= endOfDay) {
      return {};
    }

    return this._scheduleTasks(
      user,
      tasks,
      busySlotsWithDates,
      planFrom,
      endOfDay,
    );
  }

  /**
   * Generates a new plan from the current time forward.
   * effect: discards remaining scheduled tasks and generates a new plan from the current time forward; returns the first task, if any.
   */
  async replan(
    { user, tasks, busySlots }: {
      user: User;
      tasks: TaskWithDuration[];
      busySlots: BusySlot[];
    },
  ): Promise<{ firstTask?: Task } | { error: string }> {
    // Convert ISO strings to Date objects (in case they came from JSON)
    const busySlotsWithDates = busySlots.map((slot) => ({
      start: new Date(slot.start),
      end: new Date(slot.end),
    }));

    const now = this.timeProvider();

    // Infer planning day from busy slots (same as planDay)
    let planningDay = now;
    if (busySlotsWithDates.length > 0) {
      const firstSlotDate = busySlotsWithDates[0].start;
      planningDay = firstSlotDate;
    }

    const startOfDay = new Date(
      planningDay.getFullYear(),
      planningDay.getMonth(),
      planningDay.getDate(),
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      planningDay.getFullYear(),
      planningDay.getMonth(),
      planningDay.getDate(),
      23,
      59,
      59,
    );

    // Delete ALL scheduled tasks for the user (to avoid timezone confusion)
    console.log(`[Planner] Replan: Clearing ALL scheduled tasks for user`);
    const deleteResult = await this.scheduledTasks.deleteMany({
      owner: user,
    });
    console.log(
      `[Planner] Deleted ${deleteResult.deletedCount} existing scheduled tasks`,
    );

    // Plan from now if it's within the planning day, otherwise from start of day
    const planFrom = (now >= startOfDay && now < endOfDay) ? now : startOfDay;

    if (planFrom >= endOfDay) {
      return {};
    }

    return this._scheduleTasks(
      user,
      tasks,
      busySlotsWithDates,
      planFrom,
      endOfDay,
    );
  }

  /**
   * Removes all scheduled tasks for a given user for the current day.
   * effect: removes all ScheduledTasks for the given user for the current day.
   */
  async clearDay({ user }: { user: User }): Promise<Empty> {
    const now = this.timeProvider();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );

    await this.scheduledTasks.deleteMany({
      owner: user,
      plannedStart: { $gte: startOfDay, $lte: endOfDay },
    });

    return {};
  }

  /**
   * Removes all scheduled tasks for a given user.
   * effect: removes all scheduled tasks for the user.
   */
  async deleteAllForUser({ user }: { user: User }): Promise<Empty> {
    await this.scheduledTasks.deleteMany({ owner: user });
    return {};
  }

  /**
   * Finds the task scheduled immediately after a completed task.
   * effect: finds the task scheduled immediately after the completedTask and returns it.
   */
  async getNextTask(
    { user, completedTask }: { user: User; completedTask: Task },
  ): Promise<{ nextTask?: Task } | { error: string }> {
    const lastTask = await this.scheduledTasks.findOne({
      owner: user,
      task: completedTask,
    });

    if (!lastTask) {
      return { error: "Completed task not found in schedule." };
    }

    const nextTask = await this.scheduledTasks.findOne(
      {
        owner: user,
        plannedStart: { $gte: lastTask.plannedEnd },
      },
      {
        sort: { plannedStart: 1 },
      },
    );

    return { nextTask: nextTask?.task };
  }

  /**
   * @query _getScheduledTasks
   * Retrieves all scheduled tasks for a given user.
   * @returns A list of scheduled tasks, sorted by start time.
   */
  async _getScheduledTasks(
    { user }: { user: User },
  ): Promise<{ tasks: ScheduledTask[] }[]> { // CORRECTED RETURN TYPE
    const tasks = await this.scheduledTasks
      .find({ owner: user }, {
        sort: { plannedStart: 1 },
      })
      .toArray();

    // CORRECT: Return the result wrapped in an array.
    // Even if there are no tasks, this will correctly return [{ tasks: [] }],
    // which the sync engine handles perfectly.
    return [{ tasks }];
  }

  /**
   * Core scheduling logic to fit tasks into available time slots.
   */
  private async _scheduleTasks(
    user: User,
    tasks: TaskWithDuration[],
    busySlots: BusySlot[],
    planFrom: DateTime,
    planUntil: DateTime,
  ): Promise<{ firstTask?: Task }> {
    console.log("[Planner] _scheduleTasks called");
    console.log("[Planner] planFrom:", planFrom);
    console.log("[Planner] planUntil:", planUntil);
    console.log("[Planner] busySlots:", JSON.stringify(busySlots, null, 2));

    const availableSlots = this._getAvailableSlots(
      planFrom,
      planUntil,
      busySlots,
    );

    console.log(
      "[Planner] availableSlots:",
      JSON.stringify(availableSlots, null, 2),
    );

    const newScheduledTasks: ScheduledTask[] = [];

    for (const task of tasks) {
      const taskDurationMillis = task.duration * 60 * 1000;

      for (const slot of availableSlots) {
        const slotDurationMillis = slot.end.getTime() - slot.start.getTime();

        if (slotDurationMillis >= taskDurationMillis) {
          const plannedStart = slot.start;
          const plannedEnd = new Date(
            plannedStart.getTime() + taskDurationMillis,
          );

          newScheduledTasks.push({
            _id: freshID(),
            owner: user,
            task: task.id,
            plannedStart,
            plannedEnd,
          });

          slot.start = plannedEnd;
          break;
        }
      }
    }

    if (newScheduledTasks.length > 0) {
      console.log(
        `[Planner] Creating ${newScheduledTasks.length} new scheduled tasks`,
      );
      await this.scheduledTasks.insertMany(newScheduledTasks);
    } else {
      console.log("[Planner] No tasks could be scheduled (no available slots)");
    }

    return {
      firstTask: newScheduledTasks.length > 0
        ? newScheduledTasks[0].task
        : undefined,
    };
  }

  /**
   * Calculates available time slots within a given window, excluding busy periods.
   */
  private _getAvailableSlots(
    start: DateTime,
    end: DateTime,
    busySlots: BusySlot[],
  ): BusySlot[] {
    const availableSlots: BusySlot[] = [];
    let cursor = start;

    const sortedBusy = busySlots.sort((a, b) =>
      a.start.getTime() - b.start.getTime()
    );

    for (const busy of sortedBusy) {
      if (busy.start > cursor) {
        availableSlots.push({ start: cursor, end: busy.start });
      }
      cursor = new Date(Math.max(cursor.getTime(), busy.end.getTime()));
    }

    if (cursor < end) {
      availableSlots.push({ start: cursor, end: end });
    }

    return availableSlots;
  }
}
