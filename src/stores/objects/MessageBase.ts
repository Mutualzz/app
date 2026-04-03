import type { MessageType, Snowflake } from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import type { MessageLikeData } from "./Message";
import { User } from "./User";
import { makeAutoObservable } from "mobx";

export class MessageBase {
    id: Snowflake;
    content?: string | null;
    createdAt: Date;
    type: MessageType;
    authorId: Snowflake;
    author?: User | null;
    protected app: AppStore;

    constructor(app: AppStore, data: MessageLikeData) {
        this.app = app;
        this.id = data.id;
        this.content = data.content;
        this.createdAt = new Date(data.createdAt);
        this.type = data.type;

        this.authorId = data.authorId;
        if (data.author) this.author = this.app.users.add(data.author);

        makeAutoObservable(this);
    }
}
