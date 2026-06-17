import { makePersistable } from "mobx-persist-store";
import { type IObservableArray, makeAutoObservable, observable } from "mobx";
import type { AppStore } from "./App.store";

type Entry = { href: string; timestamp: number };

export type AppNavigate = (opts: {
  to: string;
  replace?: boolean;
  search?: Record<string, string>;
}) => void;

export class NavigationStore {
  entries: IObservableArray<Entry> = observable.array([]);
  index = -1;
  readonly max = 15;

  private suppressRecord = false;

  constructor(private readonly app: AppStore) {
    makeAutoObservable(this, {}, { autoBind: true });

    makePersistable(this, {
      name: "NavigationStore",
      properties: ["entries", "index"],
      storage: localStorage
    });
  }

  get current() {
    if (!this.app.account) return null;
    return this.entries[this.index] || null;
  }

  get canBack() {
    if (!this.app.account) return false;
    return this.findPreviousIndex(this.index) !== null;
  }

  get canForward() {
    if (!this.app.account) return false;
    return this.findNextIndex(this.index) !== null;
  }

  clear() {
    this.entries = observable.array([]);
    this.index = -1;
  }

  private hrefKey(href: string) {
    try {
      const url = new URL(href, window.location.origin);
      let path = url.pathname;

      const userMatch = path.match(/^\/users\/([^/]+)$/i);
      if (userMatch) {
        path = `/users/${userMatch[1].toLowerCase()}`;
      }

      return `${path}${url.search}`;
    } catch {
      return href;
    }
  }

  private findPreviousIndex(fromIndex: number) {
    const currentKey =
      fromIndex >= 0 && fromIndex < this.entries.length
        ? this.hrefKey(this.entries[fromIndex].href)
        : null;

    for (let i = fromIndex - 1; i >= 0; i -= 1) {
      const key = this.hrefKey(this.entries[i].href);
      if (!currentKey || key !== currentKey) return i;
    }

    return null;
  }

  private findNextIndex(fromIndex: number) {
    const currentKey =
      fromIndex >= 0 && fromIndex < this.entries.length
        ? this.hrefKey(this.entries[fromIndex].href)
        : null;

    for (let i = fromIndex + 1; i < this.entries.length; i += 1) {
      const key = this.hrefKey(this.entries[i].href);
      if (!currentKey || key !== currentKey) return i;
    }

    return null;
  }

  private navigateToHref(navigate: AppNavigate, href: string) {
    try {
      const url = new URL(href, window.location.origin);
      const search: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        search[key] = value;
      });

      navigate({
        to: url.pathname,
        ...(Object.keys(search).length > 0 ? { search } : {})
      });
    } catch {
      navigate({ to: href });
    }
  }

  record(href: string) {
    if (!this.app.account) return;

    const key = this.hrefKey(href);

    if (this.suppressRecord) {
      this.suppressRecord = false;
      if (this.current && this.hrefKey(this.current.href) !== key) {
        this.entries[this.index] = { href, timestamp: Date.now() };
      }
      return;
    }

    if (this.current && this.hrefKey(this.current.href) === key) return;

    if (this.index < this.entries.length - 1) {
      this.entries.splice(this.index + 1);
    }

    this.entries.push({ href, timestamp: Date.now() });
    this.index = this.entries.length - 1;

    if (this.entries.length > this.max) {
      const overflow = this.entries.length - this.max;
      this.entries.splice(0, overflow);
      this.index = Math.max(0, this.index - overflow);
    }
  }

  back(navigate: AppNavigate) {
    if (!this.app.account) return;

    const previousIndex = this.findPreviousIndex(this.index);
    if (previousIndex === null) return;

    this.index = previousIndex;
    this.suppressRecord = true;
    this.navigateToHref(navigate, this.entries[this.index].href);
  }

  forward(navigate: AppNavigate) {
    if (!this.app.account) return;

    const nextIndex = this.findNextIndex(this.index);
    if (nextIndex === null) return;

    this.index = nextIndex;
    this.suppressRecord = true;
    this.navigateToHref(navigate, this.entries[this.index].href);
  }
}
