import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Checkbox, InputDefault, Stack, Typography } from "@mutualzz/ui-web";
import { type ChangeEvent, useState } from "react";
import { Button } from "@components/Button";
import { UserAvatar } from "@components/User/UserAvatar";
import { useModal } from "@contexts/Modal.context";
import { useMutation } from "@tanstack/react-query";
import type { Channel } from "@stores/objects/Channel";
import type { Snowflake } from "@mutualzz/types";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
}

export const GroupDMAddRecipientModal = observer(({ channel }: Props) => {
  const { t } = useTranslation("chat");
  const { t: tCommon } = useTranslation("common");
  const { t: tSpace } = useTranslation("space");
  const app = useAppStore();
  const { closeModal } = useModal();

  const [search, setSearch] = useState<string | null>(null);
  const [selected, setSelected] = useState<Snowflake | null>(null);
  const [hovered, setHovered] = useState<Snowflake | null>(null);

  const { mutate: addRecipient, isPending } = useMutation({
    mutationKey: ["add-group-dm-recipient", channel.id, selected],
    mutationFn: () => {
      if (!selected) throw new Error("No recipient selected");
      return app.channels.addGroupDMRecipient(channel.id, selected);
    },
    onSuccess: () => closeModal()
  });

  const existingIds = new Set(channel.recipientIds ?? []);
  const currentCount = channel.recipientIds?.length ?? 0;
  const maxCount = 10;
  const isFull = currentCount >= maxCount;
  const spotsRemaining = maxCount - currentCount;

  const suggestions = app
    .getSuggestedGroupDMRecipients()
    .filter((user) => !existingIds.has(user.id))
    .filter((user) =>
      search
        ? user.displayName.toLowerCase().includes(search.toLowerCase()) ||
          user.username.toLowerCase().includes(search.toLowerCase())
        : true
    );

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.trim().length === 0 ? null : e.target.value);
  };

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      borderRadius={12}
      direction="column"
      justifyContent="space-between"
      spacing={2.5}
      width="25vw"
    >
      <Stack p={5} direction="column" spacing={2.5}>
        <Stack direction="column" spacing={0.5}>
          <Typography fontWeight="bold" level="body-lg">
            {t("header.dm.addToGroup")}
          </Typography>
          {isFull ? (
            <Typography level="body-sm" color="danger" variant="plain">
              {t("groupDm.groupFullCount", {
                current: currentCount,
                max: maxCount
              })}
            </Typography>
          ) : (
            <Typography level="body-sm" textColor="secondary">
              {t("groupDm.spotsRemaining", { count: spotsRemaining })}
            </Typography>
          )}
        </Stack>

        {!isFull && (
          <Stack direction="column" spacing={2.5}>
            <InputDefault
              placeholder={tSpace("invites.modal.searchFriends")}
              value={search || ""}
              onChange={onChangeSearch}
            />
            <Stack
              direction="column"
              spacing={1.25}
              maxHeight="40vh"
              overflow="auto"
            >
              {suggestions.length === 0 && (
                <Typography level="body-sm" textColor="secondary">
                  {search
                    ? tSpace("invites.modal.noResults")
                    : t("groupDm.noFriendsToAdd")}
                </Typography>
              )}
              {suggestions.map((user) => (
                <Paper
                  key={user.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  onMouseEnter={() => setHovered(user.id)}
                  onMouseLeave={() => setHovered(null)}
                  variant="elevation"
                  elevation={hovered === user.id ? 3 : 1}
                  p={2.5}
                  boxShadow="none !important"
                  borderRadius={10}
                  css={{ cursor: "pointer" }}
                  onClick={() =>
                    setSelected(selected === user.id ? null : user.id)
                  }
                >
                  <Stack direction="row" alignItems="center" spacing={2.5}>
                    <UserAvatar size={36} user={user} />
                    <Stack direction="column" spacing={0.25}>
                      <Typography fontWeight={500}>
                        {user.displayName}
                      </Typography>
                      <Typography level="body-xs" textColor="secondary">
                        @{user.username}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Checkbox
                    checked={selected === user.id}
                    onChange={() =>
                      setSelected(selected === user.id ? null : user.id)
                    }
                    size="lg"
                  />
                </Paper>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>

      <Paper
        p={5}
        borderBottom="0 !important"
        borderLeft="0 !important"
        borderRight="0 !important"
        elevation={app.settings?.preferEmbossed ? 5 : 3}
        direction="row"
        spacing={2.5}
      >
        <Button
          size="lg"
          onClick={() => closeModal()}
          expand
          color="neutral"
          disabled={isPending}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          expand
          size="lg"
          disabled={!selected || isPending || isFull}
          onClick={() => addRecipient()}
          color="primary"
        >
          {t("header.dm.addToGroup")}
        </Button>
      </Paper>
    </Paper>
  );
});
