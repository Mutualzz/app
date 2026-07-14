import type { ProfileDraftState } from "@components/Profile/editor/profileEditor.utils";
import type { APIUserProfile, Snowflake } from "@mutualzz/types";
import { HttpStatusCode } from "@mutualzz/types";
import { makeAutoObservable, observable, type ObservableMap } from "mobx";
import type { AppStore } from "./App.store";
import { UserProfile } from "./objects/UserProfile";

export class ProfileStore {
  readonly profiles: ObservableMap<string, UserProfile>;
  private readonly pending = new Map<string, Promise<UserProfile | undefined>>();
  private previewDraft: ProfileDraftState | null = null;
  private previewUserId: Snowflake | null = null;

  constructor(private readonly app: AppStore) {
    this.profiles = observable.map();
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get(userId: Snowflake) {
    return this.profiles.get(userId);
  }

  add(profile: APIUserProfile) {
    const existing = this.profiles.get(profile.userId);
    if (existing) {
      existing.update(profile);
      return existing;
    }

    const created = new UserProfile(profile);
    this.profiles.set(profile.userId, created);
    return created;
  }

  update(profile: APIUserProfile) {
    this.profiles.get(profile.userId)?.update(profile) ??
      this.add(profile);
  }

  async resolve(userId: Snowflake, force = false) {
    if (this.profiles.has(userId) && !force) {
      return this.profiles.get(userId);
    }

    const inflight = this.pending.get(userId);
    if (inflight && !force) return inflight;

    const request = this.app.rest
      .get<APIUserProfile>(`/users/${userId}/profile`)
      .then((profile) => {
        if (!profile) return undefined;
        return this.add(profile);
      })
      .catch((err: unknown) => {
        const info =
          err && typeof err === "object"
            ? (err as { status?: number; message?: string })
            : {};
        const isNotFound =
          info.status === HttpStatusCode.NotFound ||
          info.message === "User not found";

        if (isNotFound) {
          this.profiles.delete(userId);
        }

        return undefined;
      })
      .finally(() => {
        this.pending.delete(userId);
      });

    this.pending.set(userId, request);
    return request;
  }

  async save(payload: Omit<APIUserProfile, "userId" | "configured" | "updatedAt"> & {
    profileMusicUrl?: string | null;
    profileMusicTrackId?: string | null;
    profileMusicTrackSource?: "itunes" | "deezer" | null;
    profileMusicTitle?: string | null;
    profileMusicAuthorName?: string | null;
  }) {
    const result = await this.app.rest.put<APIUserProfile>("/@me/profile", payload);
    if (!result) return undefined;
    this.clearPreviewDraft();
    return this.add(result);
  }

  setPreviewDraft(userId: Snowflake, draft: ProfileDraftState) {
    this.previewUserId = userId;
    this.previewDraft = draft;
  }

  getPreviewDraft(userId: Snowflake) {
    if (this.previewUserId !== userId) return null;
    return this.previewDraft;
  }

  clearPreviewDraft() {
    this.previewUserId = null;
    this.previewDraft = null;
  }

  clear() {
    this.profiles.clear();
    this.pending.clear();
    this.clearPreviewDraft();
  }
}
