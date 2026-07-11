import { ContextMenu } from "@components/ContextMenu";
import { ContextItem } from "@components/ContextItem";
import { useAppStore } from "@hooks/useStores";
import type { SkinTone } from "@renderer/utils/emojis/emojiSprite";
import { getSpriteStyle } from "@renderer/utils/emojis/emojiSprite";
import type { PickerEmoji } from "@renderer/utils/emojis/emojiPickerData";
import { observer } from "mobx-react-lite";
import { Stack, Typography } from "@mutualzz/ui-web";
import styled from "@emotion/styled";
import { StarIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

type StandardProps = {
  kind: "standard";
  emoji: PickerEmoji;
  skinTone: SkinTone;
};

type CustomProps = {
  kind: "custom";
  id: string;
  name: string;
  url: string;
  animated: boolean;
};

type Props = StandardProps | CustomProps;

const PreviewImg = styled("img")({
  width: 32,
  height: 32,
  objectFit: "contain",
  borderRadius: 4
});

export const EmojiContextMenu = observer((props: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("chat");

  if (props.kind === "standard") {
    const { emoji, skinTone } = props;
    const tone = emoji.hasSkinTones ? skinTone : null;
    const variant = tone ? emoji.skinVariations?.[tone] : null;
    const sheetX = variant ? variant.sheetX : emoji.sheetX;
    const sheetY = variant ? variant.sheetY : emoji.sheetY;
    const favKey = `${emoji.unified}:${tone ?? ""}`;
    const isFavorited = app.settings?.favoriteEmojis.includes(favKey) ?? false;

    return (
      <ContextMenu id={`emoji-${emoji.unified}`}>
        <Stack
          direction="row"
          alignItems="center"
          gap={8}
          padding="6px 8px 4px"
        >
          <span style={getSpriteStyle(sheetX, sheetY, 32)} />
          <Stack direction="column" gap={2}>
            <Typography level="label-sm" weight="bold">
              :{emoji.shortName}:
            </Typography>
            <Typography level="label-xs" textColor="muted">
              {emoji.name}
            </Typography>
          </Stack>
        </Stack>
        <ContextItem
          onClick={() => {
            app.settings?.toggleFavoriteEmoji(emoji.unified, tone);
          }}
          endDecorator={
            <StarIcon size={14} weight={isFavorited ? "fill" : undefined} />
          }
          color={isFavorited ? "warning" : undefined}
        >
          {isFavorited ? t("favorites.remove") : t("favorites.add")}
        </ContextItem>
      </ContextMenu>
    );
  }

  const { id, name, url, animated } = props;
  const favKey = `custom:${id}`;
  const isFavorited = app.settings?.favoriteEmojis.includes(favKey) ?? false;

  return (
    <ContextMenu
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      id={`emoji-custom-${id}`}
    >
      <Stack direction="row" alignItems="center" gap={8} padding="6px 8px 4px">
        <PreviewImg src={url} alt={name} draggable={false} />
        <Stack direction="column" gap={2}>
          <Typography level="label-sm" weight="bold">
            :{name}:
          </Typography>
          <Typography level="label-xs" textColor="muted">
            {animated ? `<a:${name}:${id}>` : `<:${name}:${id}>`}
          </Typography>
        </Stack>
      </Stack>
      <ContextItem
        onClick={() => {
          app.settings?.toggleFavoriteEmoji(`custom:${id}`, null);
        }}
        endDecorator={
          <StarIcon size={14} weight={isFavorited ? "fill" : undefined} />
        }
        color={isFavorited ? "warning" : undefined}
      >
        {isFavorited ? t("favorites.remove") : t("favorites.add")}
      </ContextItem>
    </ContextMenu>
  );
});
