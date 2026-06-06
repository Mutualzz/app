import { makeAutoObservable } from "mobx";
import type { PresenceActivity } from "@mutualzz/types";
import { makePersistable } from "mobx-persist-store";

export class CustomStatusStore {
  text: string = "";
  enabled: boolean = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    makePersistable(this, {
      name: "CustomStatusStore",
      properties: ["text", "enabled"],
      storage: localStorage
    });
  }

  get activity(): PresenceActivity | null {
    if (!this.enabled) return null;

    return {
      type: "custom",
      name: "",
      state: this.text
    };
  }

  set(text: string) {
    this.text = text.trim();
    this.enabled = this.text.length > 0;
  }

  clear() {
    this.text = "";
    this.enabled = false;
  }
}
