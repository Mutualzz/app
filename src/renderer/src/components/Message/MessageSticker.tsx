import { ContextMenu } from "@components/ContextMenu";
import { StickerPreviewPopup } from "@components/Preview/StickerPreviewPopup";
import { useMenu } from "@contexts/ContextMenu.context";
import type { Expression } from "@stores/objects/Expression";
import { styled } from "@mutualzz/ui-core";
import { Portal } from "@mutualzz/ui-web";

interface Props {
  sticker: Expression;
  size?: number;
}

const StickerWrapper = styled("button")<{ size: number }>(({ size }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: size,
  height: size,
  padding: 0,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  verticalAlign: "middle"
}));

const StickerImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "contain"
});

export const MessageSticker = ({ sticker, size = 160 }: Props) => {
  const { clearMenu, isOpen, openContextMenu } = useMenu();
  const menuId = `message-sticker-${sticker.id}`;

  return (
    <>
      <StickerWrapper
        type="button"
        size={size}
        aria-label={sticker.name}
        onClick={(event) => {
          if (isOpen) return clearMenu();
          const rect = event.currentTarget.getBoundingClientRect();

          openContextMenu(
            event,
            {
              id: menuId,
              type: "custom"
            },
            {
              x: Math.round(rect.left),
              y: Math.round(rect.bottom - 300)
            }
          );
        }}
      >
        <StickerImage
          src={sticker.url}
          alt={sticker.name}
          draggable={false}
          title={sticker.name}
        />
      </StickerWrapper>
      <Portal>
        <ContextMenu padding={0} id={menuId}>
          <StickerPreviewPopup expression={sticker} />
        </ContextMenu>
      </Portal>
    </>
  );
};
