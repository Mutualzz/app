import { makeAutoObservable, observable, type ObservableMap } from "mobx";
import type { APIExpression, Snowflake } from "@mutualzz/types";
import { ExpressionType } from "@mutualzz/types";
import { Expression } from "@stores/objects/Expression.ts";
import type { AppStore } from "@stores/App.store.ts";

export class ExpressionsStore {
    private readonly expressions: ObservableMap<Snowflake, Expression>;

    constructor(private readonly app: AppStore) {
        this.expressions = observable.map();

        makeAutoObservable(this);
    }

    get emojis() {
        return this.all.filter((exp) => exp.type === ExpressionType.Emoji);
    }

    get staticEmojis() {
        return this.emojis.filter((ej) => !ej.animated);
    }

    get animatedEmojis() {
        return this.emojis.filter((ej) => ej.animated);
    }

    get animated() {
        return this.all.filter((exp) => exp.animated);
    }

    get static() {
        return this.all.filter((exp) => !exp.animated);
    }

    get stickers() {
        return this.all.filter((exp) => exp.type === ExpressionType.Sticker);
    }

    get animatedStickers() {
        return this.stickers.filter((exp) => exp.animated);
    }

    get staticSticker() {
        return this.all.filter((exp) => !exp.animated);
    }

    get all() {
        return Array.from(this.expressions.values());
    }

    add(expression: APIExpression) {
        const newExpression = new Expression(this.app, expression);

        this.expressions.set(newExpression.id, newExpression);

        return newExpression;
    }

    addAll(expressions: APIExpression[]) {
        expressions.forEach((expression) => this.add(expression));
    }

    remove(id: Snowflake) {
        return this.expressions.delete(id);
    }
}
