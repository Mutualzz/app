import type { EmojiElement } from "@app-types/slate";
import { ReactNode } from "react";
import { styled } from "@mutualzz/ui-core";
import { ContextMenu } from "@components/ContextMenu";
import { DefaultEmojiPreviewPopup } from "@components/Preview/DefaultEmojiPreviewPopup";
import { Portal } from "@mutualzz/ui-web";
import { useMenu } from "@contexts/ContextMenu.context";
import { RenderElementProps } from "slate-react";

interface EmojiProps extends Omit<EmojiElement, "type" | "children"> {
  isEmojiOnly?: boolean;
  attributes?: RenderElementProps["attributes"];
  children?: ReactNode;
}

const EmojiWrapper = styled("span")<{ isEmojiOnly?: boolean }>(
  ({ isEmojiOnly }) => ({
    display: "inline-block",
    width: isEmojiOnly ? "2.25em" : "1.2em",
    height: isEmojiOnly ? "2.25em" : "1.2em",
    verticalAlign: isEmojiOnly ? "middle" : -4,
    position: "relative",
    cursor: "pointer"
  })
);

const EmojiImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "contain"
});

export const Emoji = ({
  isEmojiOnly,
  url,
  unicode,
  name,
  attributes,
  children
}: EmojiProps) => {
  const { openContextMenu, isOpen, clearMenu } = useMenu();

  return (
    <>
      <EmojiWrapper
        {...attributes}
        onClick={(event) => {
          if (isOpen) return clearMenu();
          const rect = event.currentTarget.getBoundingClientRect();

          openContextMenu(
            event,
            {
              id: `emoji-${name}`,
              type: "custom"
            },
            {
              x: Math.round(rect.left - 55),
              y: Math.round(rect.bottom - 125)
            }
          );
        }}
        isEmojiOnly={isEmojiOnly}
      >
        {children}
        <EmojiImage
          src={url}
          alt={unicode}
          draggable={false}
          aria-label={`:${name}:`}
        />
      </EmojiWrapper>
      <Portal>
        <ContextMenu padding={0} id={`emoji-${name}`}>
          <DefaultEmojiPreviewPopup name={name} url={url} />
        </ContextMenu>
      </Portal>
    </>
  );
};
