import { Logger } from "@mutualzz/logger";
import type { Snowflake } from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import type { Space } from "@stores/objects/Space";
import { SpaceMember } from "@stores/objects/SpaceMember";
import capitalize from "lodash/capitalize";
import { makeAutoObservable } from "mobx";

// TODO: Add types for this store
export class SpaceMemberListStore {
    id: Snowflake;
    memberCount: number;
    list: { name: string; items: SpaceMember[] }[] = [];
    groups: any[] = [];
    private readonly logger = new Logger({
        tag: "SpaceMemberListStore",
    });
    private readonly space: Space;

    constructor(
        private readonly app: AppStore,
        space: Space,
        data: any,
    ) {
        this.space = space;

        const { groups, id, memberCount, ops } = data;

        this.id = id;
        this.groups = groups;
        this.memberCount = memberCount;
        this.computeListData(ops);

        makeAutoObservable(this);
    }

    update(data: any) {
        const { groups, id, memberCount, ops } = data;

        this.id = id;
        this.groups = groups;
        this.memberCount = memberCount;
        this.computeListData(ops);
    }

    private computeListData(ops: any) {
        for (const i of ops) {
            const { op, items, range, item, index } = i;

            switch (op) {
                case "SYNC": {
                    let listData: {
                        title: string;
                        data: { member: SpaceMember; index: number }[];
                    }[] = [];

                    for (const entry of items ?? []) {
                        if ("group" in entry) {
                            listData.push({
                                title:
                                    entry.group.id === "online"
                                        ? "Online"
                                        : entry.group.id,
                                data: [],
                            });
                            continue;
                        }

                        if (listData.length === 0) {
                            this.logger.warn(
                                "SYNC: member without group header",
                                entry,
                            );
                            continue;
                        }

                        // m = APISpaceMember
                        const m = entry.member;
                        const memberKey =
                            m?.userId != null ? String(m.userId) : null;
                        if (!memberKey) continue;

                        let member = this.space.members.get(memberKey);

                        if (member) member.update?.(m);
                        else member = this.space.members.add(m);
                        
                        if (member) {
                            listData[listData.length - 1].data.push({
                                member,
                                index: m.index ?? 0,
                            });
                        }
                    }

                    listData = listData.filter((x) => x.data.length > 0);

                    listData = listData.map((x) => ({
                        ...x,
                        title: `${x.title} - ${x.data.length}`,
                    }));

                    // hide offline group if it has more than 100 members
                    listData = listData.filter(
                        (x) =>
                            !(
                                x.title.toLowerCase().startsWith("offline") &&
                                x.data.length >= 100
                            ),
                    );

                    this.list = listData.map((x) => ({
                        name: x.title,
                        items: x.data
                            .slice()
                            .sort((a, b) => {
                                const ua = a.member.displayName ?? "";
                                const ub = b.member.displayName ?? "";
                                return ua.localeCompare(ub, undefined, {
                                    sensitivity: "base",
                                });
                            })
                            .map((y) => y.member),
                    }));

                    this.logger.debug("SYNC built list", {
                        groups: this.list.length,
                        total: this.list.reduce(
                            (n, g) => n + g.items.length,
                            0,
                        ),
                    });

                    break;
                }

                case "DELETE": {
                    const groupIndex = range?.[0];
                    const memberIndex = range?.[1];

                    if (
                        typeof groupIndex !== "number" ||
                        !this.list[groupIndex]
                    )
                        break;

                    const entry = (items ?? [])[0];
                    if (!entry) break;

                    if ("group" in entry) {
                        this.logger.debug(
                            `Delete group ${entry.group.id} from ${this.id}`,
                            i,
                        );
                        this.list.splice(groupIndex, 1);
                        break;
                    }

                    if (typeof memberIndex !== "number") break;

                    this.logger.debug(
                        `Delete member ${entry.member.user?.username} from ${this.id}`,
                        i,
                    );
                    this.list[groupIndex].items.splice(memberIndex, 1);

                    break;
                }

                case "UPDATE": {
                    const groupIndex = range?.[0];
                    const memberIndex = range?.[1];

                    if (
                        typeof groupIndex !== "number" ||
                        !this.list[groupIndex]
                    ) {
                        this.logger.warn("UPDATE: invalid group index", i);
                        break;
                    }

                    // If index-based, treat as single-target update (like DELETE)
                    const first = (items ?? [])[0];
                    if (!first) break;

                    if ("group" in first) {
                        this.list[groupIndex].name = first.group.id;
                        this.logger.debug(
                            `Update group ${first.group.id} from ${this.id}`,
                            i,
                        );
                        break;
                    }

                    // m = APISpaceMember
                    const m = first.member;
                    const memberKey =
                        m?.userId != null ? String(m.userId) : null;
                    if (!memberKey) break;

                    const storeMember = this.space.members.get(memberKey);
                    storeMember?.update?.(m);

                    if (typeof memberIndex === "number") {
                        const visibleMember =
                            this.list[groupIndex].items[memberIndex];

                        if (
                            visibleMember &&
                            String(visibleMember.userId) === memberKey
                        ) {
                            visibleMember.update?.(m);
                        } else {
                            const idx = this.list[groupIndex].items.findIndex(
                                (x) => String(x.userId) === memberKey,
                            );
                            if (idx !== -1)
                                this.list[groupIndex].items[idx].update?.(m);
                        }
                    }

                    this.logger.debug(
                        `Update member ${m.user?.username} from ${this.id}`,
                        i,
                    );
                    break;
                }

                case "INSERT": {
                    if ("group" in item) {
                        const at =
                            typeof index === "number"
                                ? index
                                : (range?.[0] ?? this.list.length);

                        this.list.splice(at, 0, {
                            name: `${capitalize(item.group.id)}`,
                            items: [],
                        });
                        break;
                    }

                    const groupIndex = range?.[0] ?? index;
                    const memberIndex = range?.[1] ?? 0;

                    if (
                        typeof groupIndex !== "number" ||
                        !this.list[groupIndex]
                    )
                        break;

                    let memberObj: SpaceMember | undefined;

                    const memberKey =
                        item.member?.userId != null
                            ? String(item.member.userId)
                            : null;

                    if (memberKey) {
                        memberObj = this.space.members.get(memberKey);
                        memberObj?.update?.(item.member);
                    }

                    if (!memberObj) {
                        memberObj = new SpaceMember(
                            this.app,
                            this.space,
                            item.member,
                        );
                    }

                    this.list[groupIndex].items.splice(
                        memberIndex,
                        0,
                        memberObj,
                    );
                    break;
                }

                default: {
                    this.logger.warn(`Unknown OP: ${op}`);
                    break;
                }
            }
        }
    }
}
