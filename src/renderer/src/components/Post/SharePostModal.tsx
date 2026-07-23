import { UserAvatar } from "@components/User/UserAvatar";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { ChannelType } from "@mutualzz/types";
import { Button, Divider, Paper, Stack, Typography } from "@mutualzz/ui-web";
import type { Post } from "@stores/objects/Post";
import type { Channel } from "@stores/objects/Channel";
import type { User } from "@stores/objects/User";
import { Snowflake } from "@mutualzz/client";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

interface Props {
  post: Post;
}

const ShareRow = observer(
  ({
    avatar,
    name,
    sent,
    sending,
    onSend
  }: {
    avatar: React.ReactNode;
    name: React.ReactNode;
    sent: boolean;
    sending: boolean;
    onSend: () => void;
  }) => {
    const { t } = useTranslation("chat");

    return (
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {avatar}
          <Typography>{name}</Typography>
        </Stack>

        <Button
          size="sm"
          variant={sent ? "soft" : "solid"}
          disabled={sent || sending}
          onClick={onSend}
        >
          {sent ? (
            <CheckIcon />
          ) : sending ? (
            t("feed.share.sending")
          ) : (
            t("feed.share.send")
          )}
        </Button>
      </Stack>
    );
  }
);

export const SharePostModal = observer(({ post }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();
  const { t } = useTranslation("chat");
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [sendingTo, setSendingTo] = useState<Set<string>>(new Set());
  const sendingKeysRef = useRef<Set<string>>(new Set());

  const runSend = async (key: string, action: () => Promise<void>) => {
    if (sentTo.has(key) || sendingKeysRef.current.has(key)) return;

    sendingKeysRef.current.add(key);
    setSendingTo(new Set(sendingKeysRef.current));

    try {
      await action();
      setSentTo((prev) => new Set(prev).add(key));
      if (!post.shared) post.toggleShare().catch(() => {});
    } finally {
      sendingKeysRef.current.delete(key);
      setSendingTo(new Set(sendingKeysRef.current));
    }
  };

  const sendToChannel = (channel: Channel, key: string) =>
    runSend(key, async () => {
      await channel.sendMessage({
        content: "",
        nonce: Snowflake.generate(),
        sharedPostId: post.id
      });
    });

  const sendToFriend = (friend: User) => {
    const key = `friend:${friend.id}`;

    return runSend(key, async () => {
      const channel = await app.channels.openDM(friend.id);
      await channel.sendMessage({
        content: "",
        nonce: Snowflake.generate(),
        sharedPostId: post.id
      });
    });
  };

  const dmUserIds = new Set(
    app.channels.dms
      .filter((channel) => channel.type === ChannelType.DM)
      .map((channel) => channel.dmRecipient?.id)
      .filter((id): id is string => !!id)
  );

  const friendsWithoutDM = app.relationships.all
    .filter((relationship) => relationship.isFriend)
    .map((relationship) => relationship.otherUser)
    .filter((user): user is User => !!user)
    .filter((user) => !dmUserIds.has(user.id));

  const hasNothingToShow =
    app.channels.dms.length === 0 && friendsWithoutDM.length === 0;

  return (
    <Paper
      direction="column"
      p={3}
      spacing={3}
      width="24rem"
      elevation={app.settings?.preferEmbossed ? 5 : 1}
    >
      <Typography level="h6">{t("feed.share.title")}</Typography>

      <Stack direction="column" spacing={2.5} maxHeight="20rem" overflowY="auto">
        {hasNothingToShow && (
          <Typography level="body-sm" textColor="secondary">
            {t("feed.empty.shareTargets")}
          </Typography>
        )}

        {app.channels.dms.map((channel) => {
          const isGroupDM = channel.type === ChannelType.GroupDM;

          return (
            <ShareRow
              key={channel.id}
              avatar={
                isGroupDM ? (
                  <DMGroupAvatar users={channel.dmRecipientsList} size={36} />
                ) : (
                  <UserAvatar user={channel.dmRecipient} size="sm" />
                )
              }
              name={
                isGroupDM
                  ? (channel.name ??
                    channel.dmRecipients.map((r) => r.displayName).join(", "))
                  : channel.dmRecipient?.displayName
              }
              sent={sentTo.has(channel.id)}
              sending={sendingTo.has(channel.id)}
              onSend={() => {
                sendToChannel(channel, channel.id).catch(() => {});
              }}
            />
          );
        })}

        {app.channels.dms.length > 0 && friendsWithoutDM.length > 0 && (
          <Divider />
        )}

        {friendsWithoutDM.map((friend) => (
          <ShareRow
            key={friend.id}
            avatar={<UserAvatar user={friend} size="sm" />}
            name={friend.displayName}
            sent={sentTo.has(`friend:${friend.id}`)}
            sending={sendingTo.has(`friend:${friend.id}`)}
            onSend={() => {
              sendToFriend(friend).catch(() => {});
            }}
          />
        ))}
      </Stack>

      <Button variant="soft" fullWidth onClick={() => closeModal()}>
        {t("feed.share.done")}
      </Button>
    </Paper>
  );
});
