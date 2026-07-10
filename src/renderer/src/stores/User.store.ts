import { type APIUser, type Snowflake, HttpStatusCode } from "@mutualzz/types";
import { makeAutoObservable, observable, type ObservableMap } from "mobx";
import type { AppStore } from "./App.store";
import { User } from "./objects/User";

export class UserStore {
  readonly users: ObservableMap<string, User>;

  constructor(private readonly app: AppStore) {
    this.users = observable.map();
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get all() {
    return Array.from(this.users.values());
  }

  get count() {
    return this.users.size;
  }

  get system() {
    return this.get("1");
  }

  clear() {
    this.users.clear();
  }

  add(user: APIUser): User {
    const exists = this.users.get(user.id);
    if (exists) return exists;

    const newUser = new User(user);
    this.users.set(user.id, newUser);
    return newUser;
  }

  addAll(users: APIUser[]): User[] {
    return users.map((user) => this.add(user));
  }

  update(user: APIUser) {
    this.users.get(user.id)?.update(user);
  }

  get(id: Snowflake) {
    return this.users.get(id);
  }

  remove(id: Snowflake) {
    this.users.delete(id);
  }

  has(id: Snowflake) {
    return this.users.has(id);
  }

  async resolveSystem() {
    const id = "1";
    if (this.has(id)) return this.get(id);
    const user = await this.app.rest.get<APIUser>(`/users/${id}`);
    if (!user) return undefined;
    return this.add(user);
  }

  async resolve(id: Snowflake, force = false) {
    if (this.has(id) && !force) return this.get(id);
    const user = await this.app.rest.get<APIUser>(`/users/${id}`);
    if (!user) return undefined;
    return this.add(user);
  }

  async resolveByIdentifier(identifier: string, force = false) {
    const normalized = identifier.trim().toLowerCase();
    const cached = this.all.find(
      (user) =>
        user.id === normalized ||
        user.username.toLowerCase() === normalized
    );
    if (cached && !force) return cached;

    try {
      const user = await this.app.rest.get<APIUser>(
        `/users/${encodeURIComponent(normalized)}`
      );
      if (!user) return undefined;
      return this.add(user);
    } catch (err: unknown) {
      const info =
        err && typeof err === "object"
          ? (err as { status?: number; message?: string })
          : {};
      const isNotFound =
        info.status === HttpStatusCode.NotFound ||
        info.message === "User not found";

      if (isNotFound) {
        const stale = this.all.find(
          (user) =>
            user.id === normalized ||
            user.username.toLowerCase() === normalized
        );
        if (stale) this.remove(stale.id);
      }

      return undefined;
    }
  }
}
