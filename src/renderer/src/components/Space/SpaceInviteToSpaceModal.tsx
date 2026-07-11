import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { Link } from "@components/Link";
import { UserAvatar } from "@components/User/UserAvatar";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { useAppStore } from "@hooks/useStores";
import type { APIInvite } from "@mutualzz/types";
import { ChannelType, HttpException, InviteType } from "@mutualzz/types";
import {
  Button,
  ButtonGroup,
  Divider,
  Input,
  InputDefault,
  Option,
  Select,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import { Invite } from "@stores/objects/Invite";
import type { Space } from "@stores/objects/Space";
import type { User } from "@stores/objects/User";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isElectron } from "@utils/index";
import Snowflake from "@utils/Snowflake";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";

interface Props {
  channel?: Channel | null;
}

const expirationOptions = [
  { key: "invites.expiry.30minutes", value: 1800 },
  { key: "invites.expiry.1hour", value: 3600 },
  { key: "invites.expiry.6hours", value: 21600 },
  { key: "invites.expiry.12hours", value: 43200 },
  { key: "invites.expiry.1day", value: 86400 },
  { key: "invites.expiry.7days", value: 604800 },
  { key: "invites.expiry.never", value: null }
] as const;

const maxUseOptions = [
  { key: "invites.maxUses.noLimit", value: 0 },
  { key: "invites.maxUses.1use", value: 1 },
  { key: "invites.maxUses.5uses", value: 5 },
  { key: "invites.maxUses.10uses", value: 10 },
  { key: "invites.maxUses.25uses", value: 25 },
  { key: "invites.maxUses.50uses", value: 50 },
  { key: "invites.maxUses.100uses", value: 100 }
] as const;

type CreateInviteResponse = APIInvite & { editSessionId?: string };

const InviteSendRow = observer(
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
    const { t: tChat } = useTranslation("chat");

    return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
      width="100%"
    >
      <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
        {avatar}
        <Typography
          css={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {name}
        </Typography>
      </Stack>

      <Button
        size="sm"
        variant={sent ? "soft" : "solid"}
        disabled={sent || sending}
        onClick={onSend}
      >
        {sent ? <CheckIcon /> : sending ? tChat("feed.share.sending") : tChat("feed.share.send")}
      </Button>
    </Stack>
    );
  }
);

export const SpaceInviteToSpaceModal = observer(({ channel }: Props) => {
  const { t } = useTranslation("space");
  const { t: tCommon } = useTranslation("common");
  const { t: tChat } = useTranslation("chat");
  const app = useAppStore();
  const [editing, setEditing] = useState(false);
  const [expiresAfter, setExpiresAfter] = useState<number | null>(
    expirationOptions[5].value
  );
  const [maxUsesAfter, setMaxUsesAfter] = useState<number>(
    maxUseOptions[0].value
  );
  const [invite, setInvite] = useState<Invite | null>(null);
  const [copied, setCopied] = useState(false);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [search, setSearch] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [sendingTo, setSendingTo] = useState<Set<string>>(new Set());
  const sendingKeysRef = useRef<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery<
    CreateInviteResponse | undefined,
    HttpException
  >({
    queryKey: ["createInvite", invite?.code],
    queryFn: () => app.spaces.active?.createInvite(channel?.id),
    enabled: !!app.spaces.active,
    refetchOnWindowFocus: false,
    refetchInterval: 0,
    refetchIntervalInBackground: false
  });

  const { mutate: updateInvite } = useMutation({
    mutationKey: ["updateInvite", invite?.code],
    mutationFn: (space: Space) =>
      app.rest.patch<APIInvite>(
        `/spaces/${space.id}/invites/${invite?.code}`,
        {
          maxUses: maxUsesAfter,
          expiresAt: expiresAfter
        },
        undefined,
        {
          ...(editSessionId && {
            "x-invite-edit-session": editSessionId
          })
        }
      ),
    onSuccess: (invite) => {
      setEditing(false);
      setInvite(new Invite(app, invite));
      setEditSessionId(null);
    }
  });

  const { mutateAsync: keepAlive } = useMutation({
    mutationKey: ["inviteKeepAlive", invite?.code],
    mutationFn: async () => {
      const spaceId = app.spaces.active?.id;
      if (!spaceId || !invite?.code || !editSessionId) return;

      await app.rest.post(
        `/spaces/${spaceId}/invites/${invite.code}/keepalive`,
        null,
        { headers: { "x-invite-edit-session": editSessionId } }
      );
    }
  });

  useEffect(() => {
    if (!editing) return;
    if (!editSessionId) return;
    if (!invite?.code) return;
    if (!app.spaces.active?.id) return;

    const id = setInterval(() => {
      keepAlive().catch(() => null);
    }, 12000);

    return () => clearInterval(id);
  }, [editing, editSessionId, invite?.code, app.spaces.active?.id]);

  useEffect(() => {
    if (!isLoading && data) {
      setInvite(new Invite(app, data));
      setEditSessionId(data.editSessionId ?? null);
    }
  }, [data, isLoading]);

  const channelToUse = channel ?? app.spaces.active?.firstNavigableChannel;

  const inviteUrl = Invite.constructUrl(invite?.code || "");

  const copyInviteLink = async () => {
    if (isElectron) await window.api.clipboard.write(inviteUrl);
    else await navigator.clipboard.writeText(inviteUrl);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSend = async (key: string, action: () => Promise<void>) => {
    if (!invite?.code || sentTo.has(key) || sendingKeysRef.current.has(key))
      return;

    sendingKeysRef.current.add(key);
    setSendingTo(new Set(sendingKeysRef.current));

    try {
      await action();
      setSentTo((prev) => new Set(prev).add(key));
    } finally {
      sendingKeysRef.current.delete(key);
      setSendingTo(new Set(sendingKeysRef.current));
    }
  };

  const sendToChannel = (targetChannel: Channel, key: string) =>
    runSend(key, async () => {
      await targetChannel.sendMessage({
        content: "",
        nonce: Snowflake.generate(),
        codedLinks: [{ type: InviteType.Space, code: invite!.code }]
      });
    });

  const sendToFriend = (friend: User) => {
    const key = `friend:${friend.id}`;

    return runSend(key, async () => {
      const dmChannel = await app.channels.openDM(friend.id);
      await dmChannel.sendMessage({
        content: "",
        nonce: Snowflake.generate(),
        codedLinks: [{ type: InviteType.Space, code: invite!.code }]
      });
    });
  };

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.trim().length === 0 ? null : e.target.value);
  };

  const spaceMemberIds = new Set(
    app.spaces.active?.members.all.map((member) => member.userId) ?? []
  );

  const matchesSearch = (user: User) =>
    !search ||
    user.displayName.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase());

  const dmUserIds = new Set(
    app.channels.dms
      .filter((ch) => ch.type === ChannelType.DM)
      .map((ch) => ch.dmRecipient?.id)
      .filter((id): id is string => !!id)
  );

  const filteredDms = app.channels.dms.filter((ch) => {
    if (ch.type === ChannelType.DM) {
      const recipient = ch.dmRecipient;
      if (!recipient || spaceMemberIds.has(recipient.id)) return false;
      return matchesSearch(recipient);
    }

    const recipients =
      ch.recipients?.filter(
        (user) => user.id !== app.account?.id && !spaceMemberIds.has(user.id)
      ) ?? [];

    if (recipients.length === 0) return false;
    if (!search) return true;

    return recipients.some((user) => matchesSearch(user));
  });

  const friendsWithoutDM = app.relationships.all
    .filter((relationship) => relationship.isFriend)
    .map((relationship) => relationship.otherUser)
    .filter((user): user is User => !!user)
    .filter((user) => !dmUserIds.has(user.id))
    .filter((user) => !spaceMemberIds.has(user.id))
    .filter(matchesSearch);

  const hasSuggestedUsers =
    filteredDms.length > 0 || friendsWithoutDM.length > 0;

  return (
    <AnimatedPaper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      borderRadius={12}
      minWidth={{ xs: "90vw", sm: 340, md: 420, lg: 500 }}
      maxWidth={500}
      direction="column"
      transparency={65}
      minHeight={300}
      maxHeight="85vh"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      alignItems="center"
      justifyContent={editing ? "center" : "flex-start"}
      spacing={0}
      px={{ xs: "0.75rem", sm: "1.5rem" }}
      py={{
        xs: "0.5rem",
        sm: "1rem"
      }}
      overflow="hidden"
    >
      {editing && (
        <>
          <Stack
            width="100%"
            direction="column"
            justifyContent="center"
            mt={2.5}
            spacing={1}
            mb={4}
          >
            <Typography level="h5" fontWeight="bold">
              {t("invites.modal.editTitle")}
            </Typography>
          </Stack>
          <Stack width="100%" direction="column" spacing={5} py={2}>
            <Stack direction="column" spacing={1}>
              <Typography level="body-sm">{t("invites.modal.expireAfter")}</Typography>
              <Select
                color="neutral"
                value={expiresAfter as number}
                onValueChange={(val) =>
                  setExpiresAfter(val as unknown as number | null)
                }
              >
                {expirationOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {t(opt.key)}
                  </Option>
                ))}
              </Select>
            </Stack>
            <Stack direction="column" spacing={1}>
              <Typography level="body-sm">{t("invites.modal.maxUses")}</Typography>
              <Select
                onValueChange={(val) => setMaxUsesAfter(val as number)}
                color="neutral"
                value={maxUsesAfter}
              >
                {maxUseOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {t(opt.key)}
                  </Option>
                ))}
              </Select>
            </Stack>
            <Stack direction="row" justifyContent="center" alignItems="center">
              <ButtonGroup spacing={10} fullWidth>
                <Button
                  onClick={() => {
                    setEditing(false);
                    setEditSessionId(null);
                  }}
                  variant="soft"
                  color="neutral"
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  onClick={() => updateInvite(app.spaces.active!)}
                  variant="solid"
                  color="success"
                >
                  {tCommon("save")}
                </Button>
              </ButtonGroup>
            </Stack>
          </Stack>
        </>
      )}
      {!editing && (
        <Stack
          width="100%"
          direction="column"
          spacing={2.5}
          flex={1}
          minHeight={0}
          overflow="hidden"
        >
          <Stack direction="column" spacing={1}>
            <Typography level="h5" fontWeight="bold">
              {t("invites.modal.title", {
                spaceName: app.spaces.active?.name || tChat("unknownSpace")
              })}
            </Typography>
            <Typography level="body-sm">
              {t("invites.modal.landingChannel", {
                channelName: channelToUse?.name || tChat("unknown")
              })}
            </Typography>
          </Stack>

          {!isLoading && !error && invite && (
            <Stack direction="column" spacing={1.5} flex={1} minHeight={0}>
              <InputDefault
                placeholder={t("invites.modal.searchFriends")}
                value={search || ""}
                onChange={onChangeSearch}
              />
              <Stack
                direction="column"
                spacing={1.5}
                flex={1}
                minHeight={0}
                overflow="auto"
                pr={0.5}
              >
                {!hasSuggestedUsers && (
                  <Typography level="body-sm" textColor="secondary">
                    {search
                      ? t("invites.modal.noResults")
                      : t("invites.modal.noFriends")}
                  </Typography>
                )}

                {filteredDms.map((targetChannel) => {
                  const isGroupDM = targetChannel.type === ChannelType.GroupDM;

                  return (
                    <InviteSendRow
                      key={targetChannel.id}
                      avatar={
                        isGroupDM ? (
                          <DMGroupAvatar
                            users={targetChannel.dmRecipientsList}
                            size={36}
                          />
                        ) : (
                          <UserAvatar
                            user={targetChannel.dmRecipient}
                            size="sm"
                          />
                        )
                      }
                      name={
                        isGroupDM
                          ? (targetChannel.name ??
                            targetChannel.dmRecipients
                              .map((recipient) => recipient.displayName)
                              .join(", "))
                          : targetChannel.dmRecipient?.displayName
                      }
                      sent={sentTo.has(targetChannel.id)}
                      sending={sendingTo.has(targetChannel.id)}
                      onSend={() => {
                        sendToChannel(targetChannel, targetChannel.id).catch(
                          () => null
                        );
                      }}
                    />
                  );
                })}

                {filteredDms.length > 0 && friendsWithoutDM.length > 0 && (
                  <Divider />
                )}

                {friendsWithoutDM.map((friend) => (
                  <InviteSendRow
                    key={friend.id}
                    avatar={<UserAvatar user={friend} size="sm" />}
                    name={friend.displayName}
                    sent={sentTo.has(`friend:${friend.id}`)}
                    sending={sendingTo.has(`friend:${friend.id}`)}
                    onSend={() => {
                      sendToFriend(friend).catch(() => null);
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          <Divider />

          <Stack direction="column" width="100%" spacing={1}>
            <Typography level="body-sm">{t("invites.modal.inviteLink")}</Typography>
            <Input
              type="text"
              readOnly
              value={error?.message || inviteUrl}
              error={!!error}
              fullWidth
              endDecorator={
                <Button
                  padding={4}
                  startDecorator={<CopyIcon />}
                  variant="soft"
                  color={error ? "danger" : "neutral"}
                  onClick={copyInviteLink}
                  disabled={isLoading || !!error || !invite || copied}
                  size="sm"
                >
                  {copied ? t("invites.copiedToClipboard") : t("invites.copyInviteUrl")}
                </Button>
              }
            />
            <Stack mt="0.5rem" justifyContent="space-between">
              {!isLoading && !error && (
                <>
                  <Typography level="body-xs" textColor="muted">
                    {t("invites.modal.expiresPrefix")}
                    <Typography>
                      {invite?.expiresAt ? (
                        <time dateTime={invite.expiresAt.toISOString()}>
                          {dayjs(invite.expiresAt).fromNow()}
                        </time>
                      ) : (
                        t("invites.modal.expiresNever")
                      )}
                    </Typography>
                    {invite?.maxUses && invite?.maxUses > 0 && (
                      <Typography level="body-xs" textColor="muted">
                        {t("invites.modal.expiresAfterUses", {
                          count: invite.maxUses
                        })}
                      </Typography>
                    )}
                    .
                  </Typography>
                  <Link
                    level="body-xs"
                    onClick={() => setEditing(true)}
                    disabled={isLoading || !!error || !invite}
                    variant="plain"
                    color="info"
                    underline="always"
                  >
                    {t("actions.editInviteLink")}
                  </Link>
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}
    </AnimatedPaper>
  );
});
