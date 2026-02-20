import { makeAutoObservable, observable } from "mobx";
import type { PresencePayload, PresenceSchedule, PresenceStatus, Snowflake, } from "@mutualzz/types";
import { makePersistable } from "mobx-persist-store";
import { safeLocalStorage } from "@utils/safeLocalStorage";

export class PresenceStore {
    scheduledStatus: PresenceSchedule | null = null;

    private readonly presences = observable.map<Snowflake, PresencePayload>();
    private scheduledTimer: number | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });

        makePersistable(this, {
            name: "PresenceStore",
            properties: ["scheduledStatus"],
            storage: safeLocalStorage,
        });
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

    getEffectiveSelfStatus(selfUserId: Snowflake): PresenceStatus {
        const now = Date.now();
        if (this.scheduledStatus && this.scheduledStatus.until > now) {
            return this.scheduledStatus.status;
        }
        return this.get(selfUserId)?.status ?? "online";
    }

    rearmScheduledStatusTimer(opts?: { onExpire?: () => void }) {
        if (this.scheduledTimer) {
            window.clearTimeout(this.scheduledTimer);
            this.scheduledTimer = null;
        }

        const schedule = this.scheduledStatus;
        if (!schedule) return;

        const now = Date.now();
        const delay = schedule.until - now;

        if (delay <= 0) {
            this.scheduledStatus = null;
            opts?.onExpire?.();
            return;
        }

        this.scheduledTimer = window.setTimeout(() => {
            this.scheduledTimer = null;

            this.scheduledStatus = null;
            opts?.onExpire?.();
        }, delay);
    }
}
