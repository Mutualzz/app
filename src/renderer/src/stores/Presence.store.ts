import { makeAutoObservable, observable } from "mobx";
import type {
  PresencePayload,
  PresenceSchedule,
  Snowflake
} from "@mutualzz/types";
import { makePersistable } from "mobx-persist-store";

export class PresenceStore {
  scheduledStatus: PresenceSchedule | null = null;
  onScheduledStatusExpire?: (schedule: PresenceSchedule) => void;

  private readonly presences = observable.map<Snowflake, PresencePayload>();
  private scheduledTimer: number | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    makePersistable(this, {
      name: "PresenceStore",
      properties: ["scheduledStatus"],
      storage: localStorage
    });
  }

  clear() {
    this.presences.clear();
  }

  upsert(userId: Snowflake, presence: PresencePayload) {
    this.presences.set(userId, presence);
  }

  get(userId: Snowflake) {
    return this.presences.get(userId) ?? null;
  }

  setScheduledStatus(schedule: PresenceSchedule | null) {
    this.scheduledStatus = schedule;
    this.rearmScheduledStatusTimer();
  }

  rearmScheduledStatusTimer() {
    if (this.scheduledTimer) {
      window.clearTimeout(this.scheduledTimer);
      this.scheduledTimer = null;
    }

    const schedule = this.scheduledStatus;
    if (!schedule) return;

    const now = Date.now();
    const delay = schedule.until - now;

    if (delay <= 0) {
      this.finishScheduledStatus(schedule);
      return;
    }

    this.scheduledTimer = window.setTimeout(() => {
      this.scheduledTimer = null;
      this.finishScheduledStatus(schedule);
    }, delay);
  }

  private finishScheduledStatus(schedule: PresenceSchedule) {
    this.scheduledStatus = null;
    this.onScheduledStatusExpire?.(schedule);
  }
}
