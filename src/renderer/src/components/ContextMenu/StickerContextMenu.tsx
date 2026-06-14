import { ContextMenu } from "@components/ContextMenu";
import { ContextItem } from "@components/ContextItem";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import { Stack, Typography } from "@mutualzz/ui-web";
import styled from "@emotion/styled";
import { StarIcon } from "@phosphor-icons/react";

type Props = {
  id: string;
  name: string;
  url: string;
  animated: boolean;
};

const PreviewImg = styled("img")({
  width: 48,
  height: 48,
  objectFit: "contain",
  borderRadius: 4
});

export const StickerContextMenu = observer(
  ({ id, name, url, animated }: Props) => {
    const app = useAppStore();
    const isFavorited = app.settings?.isFavoriteSticker(id) ?? false;

    return (
      <ContextMenu
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        id={`sticker-${id}`}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={8}
          padding="6px 8px 4px"
        >
          <PreviewImg src={url} alt={name} draggable={false} />
          <Stack direction="column" gap={2}>
            <Typography level="body-sm" fontWeight="bold">
              {name}
            </Typography>
            <Typography level="body-xs" textColor="muted">
              {animated ? "Animated sticker" : "Sticker"} · {id}
            </Typography>
          </Stack>
        </Stack>
        <ContextItem
          onClick={() => {
            app.settings?.toggleFavoriteSticker(id);
          }}
          endDecorator={
            <StarIcon size={14} weight={isFavorited ? "fill" : undefined} />
          }
          color={isFavorited ? "warning" : undefined}
        >
          {isFavorited ? "Remove from favorites" : "Add to favorites"}
        </ContextItem>
      </ContextMenu>
    );
  }
);
