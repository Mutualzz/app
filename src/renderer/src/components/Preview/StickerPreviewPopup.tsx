import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import type { CSSObject } from "@emotion/react";
import type { Expression } from "@stores/objects/Expression";
import { Divider, Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { UserAvatar } from "@components/User/UserAvatar";
import { useTranslation } from "react-i18next";

interface Props {
  expression: Expression;
  css?: CSSObject;
}

export const StickerPreviewPopup = observer(
  ({ expression, ...props }: Props) => {
    const { t } = useTranslation("chat");
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
              {expression.spaceId
                ? t("expressionPreview.stickerFromSpaceBelong")
                : expression.authorId === app.account?.id
                  ? t("expressionPreview.stickerFromYou")
                  : t("expressionPreview.stickerFromUser")}
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
                {t("expressionPreview.stickerFromSpace")}
              </Typography>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <SpaceIcon space={expression.space} />
                <Typography fontWeight="bold" level="body-sm">
                  {expression.space?.name ?? t("privateSpace")}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={1.25} direction="column">
              <Typography level="body-xs">
                {t("expressionPreview.stickerFromUser")}
              </Typography>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <UserAvatar
                  user={expression.author}
                  member={app.spaces.active?.members.get(expression.authorId)}
                />
                <Typography fontWeight="bold" level="body-sm">
                  {expression.author?.displayName ?? t("unknownUser")}
                </Typography>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>
    );
  }
);
