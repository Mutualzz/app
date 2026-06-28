import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import type { CSSObject } from "@emotion/react";
import type { Expression } from "@stores/objects/Expression";
import { Divider, Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { UserAvatar } from "@components/User/UserAvatar";

interface Props {
  expression: Expression;
  css?: CSSObject;
}

export const StickerPreviewPopup = observer(
  ({ expression, ...props }: Props) => {
    const app = useAppStore();

    return (
      <Paper
        variant="elevation"
        py={2.5}
        px={2.5}
        elevation={app.settings?.preferEmbossed ? 1 : 3}
        spacing={2.5}
        borderRadius={8}
        width={250}
        direction="column"
        {...props}
      >
        <Stack width="100%" direction="row" spacing={2.5} alignItems="center">
          <img
            src={expression.url}
            alt={expression.name}
            draggable={false}
            css={{
              width: 64,
              height: 64,
              objectFit: "contain"
            }}
          />

          <Stack spacing={1.25} direction="column">
            <Typography level="body-sm" textColor="accent" fontWeight="bold">
              {expression.name}
            </Typography>
            <Typography level="body-xs">
              {expression.animated ? "Animated sticker" : "Sticker"}
              {expression.spaceId
                ? " from one of the spaces you belong in"
                : expression.authorId === app.account?.id
                  ? " from you"
                  : " from a user"}
            </Typography>
          </Stack>
        </Stack>
        <Divider
          lineColor="muted"
          css={{
            opacity: 0.5
          }}
        />
        <Stack spacing={2.5}>
          {expression.spaceId ? (
            <Stack spacing={1.25} direction="column">
              <Typography level="body-sm">
                This sticker is from a space
              </Typography>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <SpaceIcon space={expression.space} />
                <Typography fontWeight="bold" level="body-sm">
                  {expression.space?.name ?? "Private Space"}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={1.25} direction="column">
              <Typography level="body-xs">
                This sticker is from a user
              </Typography>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <UserAvatar
                  user={expression.author}
                  member={app.spaces.active?.members.get(expression.authorId)}
                />
                <Typography fontWeight="bold" level="body-sm">
                  {expression.author?.displayName ?? "Unknown User"}
                </Typography>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>
    );
  }
);
