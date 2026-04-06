import { makeAutoObservable, observable, type ObservableMap } from "mobx";
import type { APIExpression, Snowflake } from "@mutualzz/types";
import { ExpressionType } from "@mutualzz/types";
import { Expression } from "@stores/objects/Expression.ts";
import type { AppStore } from "@stores/App.store.ts";
import { makePersistable } from "mobx-persist-store";
import { idbStorage } from "@storages/idbStorage.ts";
import { expressionBlobStorage } from "@storages/expressionBlobStorage.ts";

export class ExpressionsStore {
    readonly localExpressions: ObservableMap<Snowflake, Expression>;
    private readonly expressions: ObservableMap<Snowflake, Expression>;

    constructor(private readonly app: AppStore) {
        this.expressions = observable.map();
        this.localExpressions = observable.map();

        makeAutoObservable(this);

        makePersistable(this, {
            name: "ExpressionStore",
            properties: [
                {
                    key: "localExpressions",
                    serialize: (map: ObservableMap<Snowflake, Expression>) =>
                        Array.from(map.values()).map((exp) => exp.toJSON()),
                    deserialize: (data: APIExpression[]) => {
                        const map = observable.map<Snowflake, Expression>();
                        data.forEach((raw) => {
                            const exp = new Expression(this.app, raw);
                            map.set(exp.id, exp);
                        });
                        return map;
                    },
                },
            ],
            storage: idbStorage,
            stringify: false,
        });
    }

    get emojis() {
        return [
            ...this.expressions.values(),
            ...this.localExpressions.values(),
        ].filter((exp) => exp.type === ExpressionType.Emoji);
    }

    get stickers() {
        return [
            ...this.expressions.values(),
            ...this.localExpressions.values(),
        ].filter((exp) => exp.type === ExpressionType.Sticker);
    }

    add(expression: APIExpression) {
        const newExpression = new Expression(this.app, expression);

        this.expressions.set(newExpression.id, newExpression);

        return newExpression;
    }

    addLocal(expression: APIExpression, blob: Blob) {
        const newExpression = new Expression(this.app, expression);
        this.localExpressions.set(newExpression.id, newExpression);
        expressionBlobStorage.save(newExpression.id, blob);
        return newExpression;
    }

    removeLocal(id: Snowflake) {
        expressionBlobStorage.remove(id);
        return this.localExpressions.delete(id);
    }

    isLocal(id: Snowflake) {
        return this.localExpressions.has(id);
    }

    addAll(expressions: APIExpression[]) {
        expressions.forEach((expression) => this.add(expression));
    }

    list() {
        return [
            ...this.expressions.values(),
            ...this.localExpressions.values(),
        ];
    }

    remove(id: Snowflake) {
        return this.expressions.delete(id);
    }
}
