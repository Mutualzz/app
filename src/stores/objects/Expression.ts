import { makeAutoObservable } from "mobx";
import type { APIExpression, Snowflake } from "@mutualzz/types";
import {
    CDNRoutes,
    type ExpressionFormat,
    ImageFormat,
    type Sizes,
} from "@mutualzz/types";
import type { AppStore } from "@stores/App.store.ts";
import { REST } from "@stores/REST.store.ts";

export class Expression {
    id: Snowflake;

    type: number;
    name: string;
    assetHash: string;
    animated: boolean;

    authorId: Snowflake;
    spaceId?: Snowflake | null;

    createdAt: Date;

    local?: boolean;

    constructor(
        private readonly app: AppStore,
        data: APIExpression,
    ) {
        this.id = data.id;
        this.type = data.type;
        this.name = data.name;
        this.assetHash = data.assetHash;
        this.authorId = data.authorId;
        this.spaceId = data.spaceId;
        this.animated = data.animated;
        this.createdAt = new Date(data.createdAt);

        makeAutoObservable(this);
    }

    get space() {
        if (!this.spaceId) return null;
        return this.app.spaces.get(this.spaceId);
    }

    get author() {
        return this.app.users.get(this.authorId);
    }

    get url() {
        if(this.local) return

        return Expression.constructUrl(
            this.id,
            this.animated ?? this.assetHash.startsWith("a_"),
            this.assetHash,
        );
    }

    static constructUrl(
        expressionId: Snowflake,
        animated = false,
        hash: string,
        size: Sizes = 128,
        format: ExpressionFormat = ImageFormat.WebP,
    ) {
        return REST.makeCDNUrl(
            CDNRoutes.expression(expressionId, hash, format, size, animated),
        );
    }

    setLocal(value: boolean) {
        this.local = value;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            assetHash: this.assetHash,
            authorId: this.authorId,
            spaceId: this.spaceId,
            animated: this.animated,
            createdAt: this.createdAt,
            local: this.local,
        };
    }
}
