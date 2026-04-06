import type { MessageType, Snowflake } from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import type { MessageLikeData } from "./Message";
import { User } from "./User";
import type { Space } from "@stores/objects/Space.ts";
import type { Channel } from "@stores/objects/Channel.ts";
import { makeObservable } from "mobx";

export class MessageBase {
    id: Snowflake;
    content?: string | null;
    createdAt: Date;
    type: MessageType;
    authorId: Snowflake;
    spaceId?: Snowflake | null;
    channelId: Snowflake | null;
    protected app: AppStore;

    constructor(app: AppStore, data: MessageLikeData) {
        this.app = app;
        this.id = data.id;
        this.content = data.content;
        this.createdAt = new Date(data.createdAt);
        this.type = data.type;

        this.spaceId = data.spaceId;
        this.channelId = data.channelId;

        this.authorId = data.authorId;
        if (data.author) this._author = this.app.users.add(data.author);

        makeObservable(this);
    }

    _author?: User | null;

    get author() {
        return this.app.users.get(this.authorId) || this._author;
    }

    _space?: Space | null;

    get space() {
        if (!this.spaceId) return null;
        return this.app.spaces.get(this.spaceId) || this._space;
    }

    _channel?: Channel | null;

    get channel(): Channel | null | undefined {
        if (!this.channelId) return null;
        return (
            this.app.channels.get(this.channelId) ||
            this.space?.channels.find((ch) => ch.id === this.channelId) ||
            this._channel
        );
    }

    get member() {
        return this.space?.members.get(this.authorId);
    }
}
