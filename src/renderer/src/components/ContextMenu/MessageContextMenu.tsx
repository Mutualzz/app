import { ContextMenu } from "@components/ContextMenu";
import { ContextItem } from "@components/ContextItem";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context";
import { useRecentEmojis } from "@renderer/hooks/useRecentEmojis";
import { useAppStore } from "@hooks/useStores";
import { Divider, Stack } from "@mutualzz/ui-web";
import { styled } from "@mutualzz/ui-core";
import { Message } from "@stores/objects/Message";
import { getSpriteStyle } from "@utils/emojis/emojiSprite";
import { getQuickReactionItems } from "@utils/quickReactionEmojis";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";

const EMOJI_SIZE = 24;

const QuickEmojiButton = styled("button")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  padding: 0,
  border: "none",
  borderRadius: 8,
  background: "transparent",
  cursor: "pointer",
  flexShrink: 0,
  transition: "background 120ms ease",

  "&:hover": {
    background: theme.colors.surface
  }
}));

const CustomEmojiImg = styled("img")({
  width: EMOJI_SIZE,
  height: EMOJI_SIZE,
  objectFit: "contain",
  borderRadius: 4
});

interface Props {
  message: Message;
}

export const MessageContextMenu = observer(({ message }: Props) => {
  const app = useAppStore();
  const { clearMenu } = useMenu();
  const { recents, addRecentStandard, addRecentCustom } = useRecentEmojis();
  const quickItems = getQuickReactionItems(app, recents, 4);

  const me = message.space?.members.me;
  const canEdit = message.author?.id === app.account?.id;
  const canDelete =
    message.author?.id === app.account?.id ||
    !!me?.hasPermission("ManageMessages");

  const { mutate: deleteMessage } = useMutation({
    mutationKey: ["delete-message", message.id],
    mutationFn: (): any => message.delete()
  });

  const handleQuickReaction = (item: (typeof quickItems)[number]) => {
    if (item.kind === "standard") {
      addRecentStandard(item.emoji.unified, item.skinTone);
    } else {
      addRecentCustom(
        item.expression.id,
        item.expression.name,
        item.expression.url,
        item.expression.animated
      );
    }

    void message.toggleReaction(item.toReaction());
    clearMenu();
  };

  return (
    <ContextMenu
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      id={generateMenuIDs.message(message.channelId, message.id)}
      key={message.id}
    >
      {quickItems.length > 0 && (
        <>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            px={1}
            py={0.75}
            justifyContent="center"
          >
            {quickItems.map((item) => (
              <QuickEmojiButton
                key={item.key}
                type="button"
                onClick={() => handleQuickReaction(item)}
                aria-label={`React with ${item.title}`}
                title={`:${item.title}:`}
              >
                {item.kind === "standard" ? (
                  <span
                    style={getSpriteStyle(item.sheetX, item.sheetY, EMOJI_SIZE)}
                    aria-hidden
                  />
                ) : (
                  <CustomEmojiImg
                    src={item.expression.url}
                    alt={item.title}
                    draggable={false}
                  />
                )}
              </QuickEmojiButton>
            ))}
          </Stack>
          {(canEdit || canDelete) && (
            <Divider
              css={{
                opacity: 0.5
              }}
            />
          )}
        </>
      )}

      {canEdit && (
        <ContextItem
          onClick={() => {
            message.setEditing(true);
            clearMenu();
          }}
          endDecorator={<PencilSimpleIcon weight="fill" />}
        >
          Edit Message
        </ContextItem>
      )}

      {canDelete && (
        <ContextItem
          color="danger"
          onClick={() => {
            deleteMessage();
            clearMenu();
          }}
          endDecorator={<TrashIcon weight="fill" />}
        >
          Delete Message
        </ContextItem>
      )}
    </ContextMenu>
  );
});
