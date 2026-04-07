import { makeAutoObservable, observable, type ObservableMap } from "mobx";
import type { APIExpression, Snowflake } from "@mutualzz/types";
import { ExpressionType } from "@mutualzz/types";
import { Expression } from "@stores/objects/Expression.ts";
import type { AppStore } from "@stores/App.store.ts";

type ExpressionWithDisplayName = Expression & {
    displayName: string;
};

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

    get staticStickers() {
        return this.stickers.filter((exp) => !exp.animated);
    }

    get emojiDisplayList() {
        return this.withDuplicateSuffixes(this.emojis);
    }

    get stickerDisplayList() {
        return this.withDuplicateSuffixes(this.stickers);
    }

    get fromSpaces() {
        return this.app.spaces.all
            .map((sp) => Array.from(sp.expressions.values()))
            .flat();
    }

    get nonSpaces() {
        return Array.from(this.expressions.values());
    }

    get all() {
        return [...this.fromSpaces, ...this.nonSpaces];
    }

    add(expression: APIExpression) {
        const newExpression = new Expression(this.app, expression);

        if (expression.spaceId) {
            const space = this.app.spaces.get(expression.spaceId);
            if (space) {
                space.addExpression(expression);
                return newExpression;
            }
        }

        this.expressions.set(newExpression.id, newExpression);

        return newExpression;
    }

    addAll(expressions: APIExpression[]) {
        expressions.forEach((expression) => this.add(expression));
    }

    remove(id: Snowflake) {
        return this.expressions.delete(id);
    }

    get(id: Snowflake) {
        return this.expressions.get(id);
    }

    has(id: Snowflake) {
        return this.expressions.has(id);
    }

    async resolve(id: Snowflake, force = false) {
        const spaceFlattenedExpressions = this.app.spaces.all
            .flat()
            .map((sp) => Array.from(sp.expressions.values()))
            .flat();

        const allResolved = [...spaceFlattenedExpressions, ...this.all];

        const foundExpression = allResolved.find((exp) => exp.id === id);
        if (foundExpression && !force) return foundExpression;

        const expression = await this.app.rest.get<APIExpression>(
            `/expressions/${id}`,
        );

        if (!expression) return undefined;

        if (expression.spaceId) {
            const space = this.app.spaces.get(expression.spaceId);
            if (space) space.addExpression(expression);
            return new Expression(this.app, expression);
        }

        return this.add(expression);
    }

    private withDuplicateSuffixes(expressions: Expression[]) {
        const counts = new Map<string, number>();
        const seen = new Map<string, number>();

        for (const exp of expressions) {
            const key = `${exp.type}:${exp.name.trim().toLowerCase()}`;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }

        return expressions.map((exp) => {
            const key = `${exp.type}:${exp.name.trim().toLowerCase()}`;
            const total = counts.get(key) ?? 0;
            const index = (seen.get(key) ?? 0) + 1;
            seen.set(key, index);

            return {
                ...exp,
                displayName: total > 1 ? `${exp.name}~${index}` : exp.name,
            } satisfies ExpressionWithDisplayName;
        });
    }
}
