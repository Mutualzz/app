import { AvatarDraw } from "@components/Avatar/AvatarDraw";
import type { AvatarEditorMethod } from "@components/Avatar/avatarEditor.types";
import { AvatarUpload } from "@components/Avatar/AvatarUpload";
import { Avatars } from "@components/Avatar/Avatars";
import { UserAvatar } from "@components/User/UserAvatar";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Divider, Paper, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import {
  ImagesIcon,
  PaintBrushIcon,
  PaletteIcon,
  UploadSimpleIcon
} from "@phosphor-icons/react";
import { ColorLike } from "@mutualzz/ui-core";

const METHOD_CARDS: {
  method: AvatarEditorMethod;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    method: "upload",
    title: "Upload",
    description: "Use a photo or GIF from your device.",
    icon: <UploadSimpleIcon weight="fill" size={22} />
  },
  {
    method: "draw",
    title: "Draw",
    description: "Sketch a custom avatar on the canvas.",
    icon: <PaintBrushIcon weight="fill" size={22} />
  },
  {
    method: "avatars",
    title: "Avatars",
    description: "Pick a default style or restore a previous one.",
    icon: <ImagesIcon weight="fill" size={22} />
  }
];

export const UserProfileSettings = observer(() => {
  const app = useAppStore();
  const account = app.account;
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const embossed = app.settings?.preferEmbossed;

  const { mutate: deleteAvatar, isPending } = useMutation({
    mutationKey: ["delete-avatar"],
    mutationFn: () => app.rest.patch("@me", { avatar: null }),
    onSuccess: () => {
      closeModal();
    }
  });

  const openProfileEditor = () => {
    closeModal();
    navigate({ to: "/profile" });
  };

  const openAvatarStudio = (method?: AvatarEditorMethod) => {
    closeModal();
    navigate({
      to: "/avatar",
      search: { method: method ?? "upload" }
    });
  };

  const openQuickModal = (method: AvatarEditorMethod) => {
    if (method === "upload") {
      openModal("avatar-upload", <AvatarUpload />);
      return;
    }
    if (method === "draw") {
      openModal("avatar-draw", <AvatarDraw />);
      return;
    }
    openModal("avatars", <Avatars />);
  };

  if (!account) return null;

  return (
    <Stack
      direction="column"
      spacing={{ xs: 1.25, sm: 2 }}
      width="100%"
      maxWidth={520}
    >
      <Paper
        direction="column"
        borderRadius={12}
        elevation={embossed ? 2 : 0}
        boxShadow="none !important"
      >
        <Paper
          variant="solid"
          color={account.accentColor as ColorLike}
          height={72}
          width="100%"
          borderRadius="8px 8px 0 0"
        />
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="flex-end"
          px={2}
          pb={2}
          mt={-5.5}
        >
          <UserAvatar user={account} size={88} badge />
          <Stack
            direction="column"
            spacing={0.25}
            pb={0.5}
            minWidth={0}
            flex={1}
          >
            <Typography
              level="title-md"
              fontWeight={600}
              css={{ lineHeight: 1.2 }}
            >
              {account.displayName}
            </Typography>
            <Typography level="body-sm" css={{ opacity: 0.75 }}>
              @{account.username}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        variant="soft"
        borderRadius={12}
        p={2}
        direction="column"
        spacing={1.25}
        elevation={embossed ? 2 : 0}
        boxShadow="none !important"
      >
        <Stack direction="column" spacing={0.5}>
          <Typography level="title-sm" fontWeight={600}>
            Avatar studio
          </Typography>
          <Typography level="body-sm" css={{ opacity: 0.75 }}>
            Open the full editor for upload, drawing, and previews — or jump in
            quickly below.
          </Typography>
        </Stack>
        <Button color="primary" onClick={() => openAvatarStudio()}>
          Open Avatar Studio
        </Button>
      </Paper>

      <Stack direction="column" spacing={1}>
        {METHOD_CARDS.map((card) => (
          <Paper
            key={card.method}
            variant="soft"
            borderRadius={12}
            p={1.5}
            direction="row"
            spacing={1.25}
            alignItems="center"
            elevation={embossed ? 1 : 0}
            boxShadow="none !important"
            css={{ cursor: "pointer" }}
            onClick={() => openAvatarStudio(card.method)}
          >
            <Paper
              variant="plain"
              borderRadius={10}
              p={1}
              alignItems="center"
              justifyContent="center"
            >
              {card.icon}
            </Paper>
            <Stack direction="column" spacing={0.25} flex={1}>
              <Typography level="body-sm" fontWeight={600}>
                {card.title}
              </Typography>
              <Typography level="body-xs" css={{ opacity: 0.75 }}>
                {card.description}
              </Typography>
            </Stack>
            <Button
              size="sm"
              color="neutral"
              variant="soft"
              onClick={(event) => {
                event.stopPropagation();
                openQuickModal(card.method);
              }}
            >
              Quick edit
            </Button>
          </Paper>
        ))}
      </Stack>

      <Button
        disabled={isPending || !account.avatar}
        onClick={() => deleteAvatar()}
        color="danger"
        size="sm"
        css={{ alignSelf: "flex-start" }}
      >
        Remove current avatar
      </Button>

      <Divider css={{ opacity: 0.35 }} />

      <Paper
        variant="soft"
        borderRadius={12}
        p={2}
        direction="column"
        spacing={1.25}
        elevation={embossed ? 2 : 0}
        boxShadow="none !important"
      >
        <Stack direction="column" spacing={0.5}>
          <Typography level="title-sm" fontWeight={600}>
            Profile page
          </Typography>
          <Typography level="body-sm" css={{ opacity: 0.75 }}>
            Customize your MySpace-style page with blocks, banner, bio, and
            profile music.
          </Typography>
        </Stack>
        <Button
          color="primary"
          startDecorator={<PaletteIcon weight="fill" />}
          onClick={openProfileEditor}
        >
          Customize Profile
        </Button>
      </Paper>
    </Stack>
  );
});
