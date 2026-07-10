import { makeAutoObservable, observable } from "mobx";
import { makePersistable } from "mobx-persist-store";
import { AppStore } from "@stores/App.store";
import { Relationship } from "@stores/objects/Relationship";
import { APIRelationship, APIInvite, Snowflake } from "@mutualzz/types";

function relationshipKey(userId: Snowflake, otherUserId: Snowflake) {
  return BigInt(userId) < BigInt(otherUserId)
    ? `${userId}:${otherUserId}`
    : `${otherUserId}:${userId}`;
}

export interface AcceptedFriendNotification {
  id: string;
  userId: Snowflake;
  createdAt: number;
}

const MAX_ACCEPTED_NOTIFICATIONS = 20;

export class RelationshipStore {
  private readonly relationships = observable.map<string, Relationship>();

  acceptedNotifications = observable.array<AcceptedFriendNotification>([]);

  constructor(private readonly app: AppStore) {
    makeAutoObservable(this, {}, { autoBind: true });

    makePersistable(this, {
      name: "RelationshipStore",
      properties: ["acceptedNotifications"],
      storage: localStorage
    });
  }

  get all() {
    return Array.from(this.relationships.values());
  }

  get count() {
    return this.relationships.size;
  }

  clear() {
    this.relationships.clear();
  }

  add(data: APIRelationship): Relationship {
    const key = relationshipKey(data.userId, data.otherUserId);
    const exists = this.relationships.get(key);
    if (exists) return exists;

    const relationship = new Relationship(this.app, data);
    this.relationships.set(key, relationship);
    return relationship;
  }

  addAll(data: APIRelationship[]): Relationship[] {
    return data.map((relationship) => this.add(relationship));
  }

  update(data: APIRelationship) {
    const key = relationshipKey(data.userId, data.otherUserId);
    const existing = this.relationships.get(key);
    if (!existing) return this.add(data);

    const wasOutgoing = existing.isOutgoingRequest;
    const updated = existing.update(data);

    if (wasOutgoing && updated.isFriend) {
      this.recordAccepted(updated);
    }

    return updated;
  }

  private recordAccepted(relationship: Relationship) {
    const userId = relationship.otherUserIdForMe;
    if (!userId) return;
    if (this.acceptedNotifications.some((n) => n.userId === userId)) return;

    this.acceptedNotifications.unshift({
      id: relationship.id,
      userId,
      createdAt: Date.now()
    });

    if (this.acceptedNotifications.length > MAX_ACCEPTED_NOTIFICATIONS)
      this.acceptedNotifications.length = MAX_ACCEPTED_NOTIFICATIONS;
  }

  dismissAcceptedNotification(id: string) {
    const idx = this.acceptedNotifications.findIndex((n) => n.id === id);
    if (idx !== -1) this.acceptedNotifications.splice(idx, 1);
  }

  remove(userId: Snowflake, otherUserId: Snowflake) {
    this.relationships.delete(relationshipKey(userId, otherUserId));
  }

  get(userId: Snowflake, otherUserId: Snowflake) {
    return this.relationships.get(relationshipKey(userId, otherUserId));
  }

  getForMe(userId: Snowflake) {
    const me = this.app.account?.id;
    if (!me) return undefined;

    return this.get(me, userId) || this.get(userId, me);
  }

  get allNonBlocked() {
    return this.all.filter((r) => !r.isBlocked);
  }

  get friends() {
    return this.all.filter((r) => r.isFriend);
  }

  getFriendByUserId(userId: Snowflake) {
    const rel = this.getForMe(userId);
    return rel?.isFriend ? rel : undefined;
  }

  getIncoming() {
    return this.all.filter((r) => r.isIncomingRequest);
  }

  get online() {
    return this.all
      .filter((r) => r.isFriend)
      .filter((r) => {
        const friendId = r.otherUserIdForMe;
        if (!friendId) return false;
        const status = this.app.presence.get(friendId)?.status ?? "offline";
        return status !== "offline" && status !== "invisible";
      });
  }

  get outgoing() {
    return this.all.filter((r) => r.isOutgoingRequest);
  }

  get incoming() {
    return this.all.filter((r) => r.isIncomingRequest);
  }

  get pending() {
    return [...this.incoming, ...this.outgoing];
  }

  get blocked() {
    return this.all.filter((r) => r.isBlocked);
  }

  isFriend(userId: Snowflake) {
    return this.getFriendByUserId(userId) != null;
  }

  isBlocked(userId: Snowflake) {
    return this.getForMe(userId)?.isBlocked ?? false;
  }

  async resolveAll(force = false) {
    if (!force && this.count > 0) return this.all;
    const data =
      await this.app.rest.get<APIRelationship[]>(`/@me/relationships`);
    if (!data) return [];
    return this.addAll(data);
  }

  async sendFriendRequest(identifier: string) {
    return this.app.rest.post<APIRelationship>(`/@me/relationships`, {
      identifier
    });
  }

  async acceptFriendRequest(userId: Snowflake) {
    return this.app.rest.patch<APIRelationship>(
      `/@me/relationships/${userId}/accept`
    );
  }

  async declineFriendRequest(userId: Snowflake) {
    return this.app.rest.patch(`/@me/relationships/${userId}/decline`);
  }

  async cancelFriendRequest(userId: Snowflake) {
    return this.app.rest.delete(`/@me/relationships/${userId}`);
  }

  async removeFriend(userId: Snowflake) {
    return this.app.rest.delete(`/@me/relationships/${userId}`);
  }

  async blockUser(userId: Snowflake) {
    return this.app.rest.put<APIRelationship>(
      `/@me/relationships/${userId}/block`
    );
  }

  async unblockUser(userId: Snowflake) {
    return this.app.rest.delete(`/@me/relationships/${userId}/block`);
  }

  async getFriendInvite() {
    return this.app.rest.get<APIInvite | null>(`/@me/invites/friend`);
  }

  async createFriendInvite() {
    return this.app.rest.post<APIInvite>(`/@me/invites/friend`, {});
  }

  async acceptFriendInvite(code: string) {
    return this.app.rest.put<APIRelationship>(`/invites/${code}/friend`, {});
  }
}
