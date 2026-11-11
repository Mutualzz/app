import { makeAutoObservable } from "mobx";

interface Announcement {
  id: number;
  text: string;
}

export class AnnouncerStore {
  current: Announcement | null = null;
  private nextId = 0;
  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  announce(text: string) {
    if (!text.trim()) return;

    this.nextId += 1;
    this.current = { id: this.nextId, text };

    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.clearTimer = setTimeout(this.clear, 5000);
  }

  clear() {
    this.current = null;
  }
}
