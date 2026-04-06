import type { APIMessage, APIMessageEmbed, Snowflake } from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import { makeObservable } from "mobx";
import { MessageBase } from "./MessageBase";
import type { QueuedMessage, QueuedMessageData } from "./QueuedMessage";

export type MessageLike = Message | QueuedMessage;
export type MessageLikeData = APIMessage | QueuedMessageData;

export class Message extends MessageBase {
    channelId: Snowflake;
    updatedAt?: Date | null;

    nonce?: Snowflake | null;
    spaceId?: Snowflake | null;
    embeds: APIMessageEmbed[];

    edited: boolean;

    constructor(app: AppStore, data: APIMessage) {
        super(app, data);

        this.id = data.id;

        this.channelId = data.channelId;
        if (data.channel) this._channel = this.app.channels.add(data.channel);

        this.content = data.content;
        this.createdAt = new Date(data.createdAt);
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
        this.nonce = data.nonce;
        this.edited = data.edited ?? false;
        this.channelId = data.channelId;

        this.embeds = data.embeds;

        this.spaceId = data.spaceId;
        if (data.space) this._space = this.app.spaces.add(data.space);

        makeObservable(this);
    }

    update(message: APIMessage) {
        this.id = message.id;
        this.channelId = message.channelId;

        if (message.channel)
            this._channel = this.app.channels.add(message.channel);

        this.spaceId = message.spaceId ?? null;
        if (message.space) this._space = this.app.spaces.add(message.space);

        this.content = message.content;
        this.nonce = message.nonce ?? null;
        this.embeds = message.embeds ?? this.embeds ?? [];

        this.createdAt = new Date(message.createdAt);
        this.updatedAt = message.updatedAt ? new Date(message.updatedAt) : null;

        this.edited = message.edited ?? this.edited;
    }

    async delete() {
        return this.app.rest.delete(
            `/channels/${this.channelId}/messages/${this.id}`,
        );
    }
}
