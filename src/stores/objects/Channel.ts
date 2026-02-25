import { Logger } from "@mutualzz/logger";
import {
    type APIChannel,
    type APIMessage,
    CDNRoutes,
    type ChannelIconFormat,
    ChannelType,
    ImageFormat,
    type Sizes,
    type Snowflake,
    type VoiceState,
} from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import { MessageStore } from "@stores/Message.store";
import { Message } from "@stores/objects/Message";
import type { Space } from "@stores/objects/Space";
import { makeAutoObservable, observable } from "mobx";
import type { QueuedMessage } from "./QueuedMessage";
import { ChannelPermissionOverwrite } from "./ChannelOverwrite";
import { BitField, channelFlags, type ChannelFlags, } from "@mutualzz/permissions";
import { murmur } from "@utils/index.ts";
import { REST } from "@stores/REST.store.ts";

function getOverwriteKey(ow: ChannelPermissionOverwrite): string {
    if (ow.roleId != null) return `r:${ow.roleId}`;
    if (ow.userId != null) return `u:${ow.userId}`;

    return "x";
}

export class Channel {
    id: Snowflake;
    type: ChannelType;
    name?: string | null;
    topic?: string | null;
    position: number;
    nsfw: boolean;
    createdAt: Date;
    updatedAt: Date;
    flags: BitField<ChannelFlags>;
    messages: MessageStore;
    parentId?: Snowflake | null;
    parent?: Channel | null;
    spaceId?: Snowflake | null;
    space?: Space | null;
    raw: APIChannel;
    lastMessageId?: Snowflake | null;
    lastMessage?: Message | null;
    overwrites: ChannelPermissionOverwrite[] = [];
    icon?: string | null;
    voiceStates = observable.map<Snowflake, VoiceState>();
    private readonly logger = new Logger({
        tag: "Channel",
    });
    private hasFetchedInitialMessages = false;

    constructor(
        private readonly app: AppStore,
        channel: APIChannel,
    ) {
        this.app = app;

        this.id = channel.id;
        this.type = channel.type;

        this.name = channel.name;
        this.topic = channel.topic;

        this.parentId = channel.parentId;
        if (channel.parent) this.parent = this.app.channels.add(channel.parent);

        this.spaceId = channel.spaceId;

        if (channel.space) this.space = this.app.spaces.add(channel.space);

        this.position = channel.position;

        this.nsfw = channel.nsfw;

        this.flags = BitField.fromString(
            channelFlags,
            channel.flags.toString(),
        );

        this.icon = channel.icon;

        this.createdAt = new Date(channel.createdAt);
        this.updatedAt = new Date(channel.updatedAt);

        this.raw = channel;

        this.messages = new MessageStore(this.app, this.id);

        if (channel.messages) this.messages.addAll(channel.messages);

        this.lastMessageId = channel.lastMessageId;
        if (channel.lastMessage)
            this.lastMessage = this.messages.add(channel.lastMessage);

        this.overwrites = (channel.overwrites ?? []).map(
            (ow) => new ChannelPermissionOverwrite(ow),
        );

        makeAutoObservable(this);
    }

    get listId() {
        const parts: string[] = [];

        // p = parent
        // c = channel
        const add = (
            prefix: "p" | "c",
            overwrites?: ChannelPermissionOverwrite[] | null,
        ) => {
            if (!overwrites?.length) return;

            for (const ow of overwrites) {
                const key = getOverwriteKey(ow);

                if (ow.allow.has("ViewChannel"))
                    parts.push(`${prefix}:a:${key}`);
                if (ow.deny.has("ViewChannel"))
                    parts.push(`${prefix}:d:${key}`);
            }
        };

        add("p", this.parent?.overwrites);
        add("c", this.overwrites);

        const sorted = Array.from(new Set(parts)).sort();
        if (!sorted.length) return "everyone";

        return murmur(sorted.join(","));
    }

    get iconUrl() {
        if (!this.icon) return null;
        return Channel.constructIconUrl(
            this.id,
            this.icon.startsWith("a_"),
            this.icon,
        );
    }

    get hasChildren(): boolean {
        return this.app.channels.all.some((ch) => ch.parent?.id === this.id);
    }

    get hasParent(): boolean {
        return !!this.raw.parentId;
    }

    get isDM() {
        return (
            this.type === ChannelType.DM || this.type === ChannelType.GroupDM
        );
    }

    get isTextChannel() {
        return this.type === ChannelType.Text;
    }

    get isVoiceChannel() {
        return this.type === ChannelType.Voice;
    }

    get isCategory() {
        return this.type === ChannelType.Category;
    }

    static constructIconUrl(
        channelId: Snowflake,
        animated = false,
        hash?: string | null,
        size: Sizes = 128,
        format: ChannelIconFormat = ImageFormat.WebP,
    ) {
        if (!hash) return null;
        return REST.makeCDNUrl(
            CDNRoutes.channelIcon(channelId, hash, format, size, animated),
        );
    }

    addVoiceState(state: VoiceState) {
        this.voiceStates.set(state.userId, state);
    }

    removeVoiceState(userId: Snowflake) {
        this.voiceStates.delete(userId);
    }

    update(channel: APIChannel) {
        this.type = channel.type;
        this.name = channel.name;
        this.topic = channel.topic;
        this.position = channel.position;
        this.nsfw = channel.nsfw;

        this.parentId = channel.parentId ?? null;
        this.parent = channel.parent
            ? this.app.channels.add(channel.parent)
            : null;

        this.spaceId = channel.spaceId ?? null;
        this.space = channel.space
            ? this.app.spaces.add(channel.space)
            : (this.space ?? null);

        this.overwrites = (channel.overwrites ?? []).map(
            (ow) => new ChannelPermissionOverwrite(ow),
        );

        this.flags = BitField.fromString(
            channelFlags,
            channel.flags.toString(),
        );

        this.createdAt = new Date(channel.createdAt);
        this.updatedAt = new Date(channel.updatedAt);

        this.raw = channel;

        this.lastMessageId = channel.lastMessageId ?? null;
        this.lastMessage = channel.lastMessage
            ? this.messages.add(channel.lastMessage)
            : (this.lastMessage ?? null);

        this.space?.members.me?.invalidateChannelPermCache?.();
    }

    setParent(channel: Channel | null) {
        this.parentId = channel?.id || null;
        this.space?.members.me?.invalidateChannelPermCache?.();
    }

    getMessages(
        isInitial: boolean,
        limit?: number,
        before?: string,
        after?: string,
        around?: string,
    ): Promise<number> {
        return new Promise((resolve, reject) => {
            if (isInitial && this.hasFetchedInitialMessages) return;

            let opts: Record<string, any> = {
                limit: limit || 50,
            };

            if (before) opts = { ...opts, before };

            if (after) opts = { ...opts, after };

            if (around) opts = { ...opts, around };

            if (isInitial)
                this.logger.info(`Fetching initial messages for ${this.id}`);
            else
                this.logger.info(
                    `Fetching messages for ${this.id} before ${before}`,
                );

            this.app.rest
                .get<APIMessage[]>(`/channels/${this.id}/messages`, opts)
                .then((res) => {
                    this.messages.addAll(
                        res.filter((x) => !this.messages.has(x.id)),
                    );
                    this.hasFetchedInitialMessages = true;
                    resolve(res.length);
                })
                .catch((err) => {
                    this.logger.error(err);
                    reject(err);
                });
        });
    }

    async sendMessage(
        data: { content: string; nonce: string } | FormData,
        msg?: QueuedMessage,
    ) {
        if (data instanceof FormData)
            return this.app.rest
                .postFormData<APIMessage>(
                    `/channels/${this.id}/messages`,
                    data,
                    undefined,
                    undefined,
                    msg,
                )
                .catch((err) => {
                    this.logger.error(err);
                    throw err;
                });

        return this.app.rest
            .post<
                APIMessage,
                { content: string; nonce: string }
            >(`/channels/${this.id}/messages`, data)
            .catch((err) => {
                this.logger.error(err);
                throw err;
            });
    }

    delete(parentOnly: boolean) {
        return this.app.rest.delete<{
            spaceId?: string;
            channelId: string;
        }>(`/channels/${this.id}`, {
            parentOnly,
            spaceId: this.raw.spaceId ?? undefined,
        });
    }
}
