import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Checkbox, InputDefault, Stack, Typography } from "@mutualzz/ui-web";
import { ChangeEvent, useState } from "react";
import { Button } from "@components/Button";
import { UserAvatar } from "@components/User/UserAvatar";
import { useModal } from "@contexts/Modal.context";
import { useMutation } from "@tanstack/react-query";
import { Snowflake } from "@mutualzz/types";
import { useNavigate } from "@tanstack/react-router";

export const DMChannelCreate = observer(() => {
  const app = useAppStore();
  const [search, setSearch] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<Snowflake[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  const navigate = useNavigate();

  const { closeModal } = useModal();

  const { mutate: createMessage, isPending: isCreating } = useMutation({
    mutationKey: ["create-message"],
    mutationFn: () => {
      if (recipients.length === 1) {
        const recipient = recipients[0];
        return app.channels.openDM(recipient);
      }

      return app.channels.openGroupDM(recipients);
    },
    onSuccess: (channel) => {
      if (channel)
        navigate({
          to: `/@me/${channel.id}`,
          replace: true
        });

      closeModal();
    }
  });

  const suggestions = app
    .getSuggestedGroupDMRecipients()
    .filter((user) =>
      search
        ? user.displayName.includes(search) || user.username.includes(search)
        : true
    );

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.trim().length === 0 ? null : e.target.value);
  };

  const addRecipient = (recipient: string) => {
    if (recipients.includes(recipient)) return;
    setRecipients([...recipients, recipient]);
  };

  const removeRecipient = (recipient: string) => {
    setRecipients(recipients.filter((r) => r !== recipient));
  };

  const hasRecipient = (recipient: string) => recipients.includes(recipient);

  const toggleRecipient = (recipient: string) => {
    if (recipients.includes(recipient)) removeRecipient(recipient);
    else addRecipient(recipient);
  };

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      justifyContent="space-between"
      spacing={2.5}
      height="60vh"
      width="25vw"
    >
      <Stack direction="column" spacing={2.5}>
        <Stack direction="column" spacing={2.5}>
          <Typography fontWeight="bold" level="body-lg">
            New Message
          </Typography>
          <Typography>You can add 9 more friends.</Typography>
        </Stack>
        <Stack direction="column" spacing={2.5}>
          <InputDefault value={search || ""} onChange={onChangeSearch} />
          <Stack
            direction="column"
            spacing={1.25}
            maxHeight="40vh"
            overflow="auto"
          >
            {suggestions?.map((user) => (
              <Paper
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
                css={{
                  cursor: "pointer"
                }}
                onClick={() => toggleRecipient(user.id)}
              >
                <Stack direction="row" alignItems="center" spacing={2.5}>
                  <UserAvatar size={36} user={user} />
                  <Stack direction="column" spacing={0.25}>
                    <Typography fontWeight={500}>{user.displayName}</Typography>
                    <Typography level="body-xs" textColor="secondary">
                      @{user.username}
                    </Typography>
                  </Stack>
                </Stack>
                <Checkbox
                  checked={hasRecipient(user.id)}
                  onChange={() => toggleRecipient(user.id)}
                  size="lg"
                />
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={2.5}>
        <Button
          size="lg"
          onClick={() => closeModal()}
          expand
          color="neutral"
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button
          expand
          size="lg"
          disabled={
            recipients.length === 0 || isCreating || recipients.length === 9
          }
          onClick={() => createMessage()}
          color="primary"
        >
          Create Message
        </Button>
      </Stack>
    </Paper>
  );
});
