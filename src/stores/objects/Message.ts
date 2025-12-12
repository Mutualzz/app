import type { APIMessage, APIMessageEmbed, Snowflake } from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import type { Space } from "@stores/objects/Space.ts";
import { makeObservable } from "mobx";
import { Channel } from "./Channel";
import { MessageBase } from "./MessageBase";
import type { QueuedMessage, QueuedMessageData } from "./QueuedMessage";

export type MessageLike = Message | QueuedMessage;
export type MessageLikeData = APIMessage | QueuedMessageData;

export class Message extends MessageBase {
    channelId: Snowflake;
    channel?: Channel | null;
    updatedAt?: Date | null;

    nonce?: Snowflake | null;
    spaceId?: Snowflake | null;
    space?: Space | null;

    embeds: APIMessageEmbed[];

    edited: boolean;

    constructor(app: AppStore, data: APIMessage) {
        super(app, data);

        this.id = data.id;
        this.channelId = data.channelId;
        if (data.channel) {
            this.channel = new Channel(this.app, data.channel);
        }
        this.content = data.content;
        this.createdAt = new Date(data.createdAt);
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
        this.nonce = data.nonce;
        this.edited = data.edited ?? false;

        this.embeds = data.embeds;

        if (data.spaceId) {
            this.spaceId = data.spaceId;
        }

        makeObservable(this);
    }

    update(message: APIMessage) {
        Object.assign(this, message);

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
