import type { CustomEmojiElement } from "@app-types/slate";
import { ReactNode } from "react";
import { styled } from "@mutualzz/ui-core";
import { ContextMenu } from "@components/ContextMenu";
import { CustomEmojiPreviewPopup } from "@components/Preview/CustomEmojiPreviewPopup";
import { Portal } from "@mutualzz/ui-web";
import { useMenu } from "@contexts/ContextMenu.context";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import { RenderElementProps } from "slate-react";

interface CustomEmojiProps extends Omit<
  CustomEmojiElement,
  "type" | "children"
> {
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
    cursor: "pointer"
  })
);

const EmojiImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "contain"
});

const CustomEmoji = observer(
  ({
    isEmojiOnly,
    url,
    name,
    id,
    animated,
    attributes,
    children
  }: CustomEmojiProps) => {
    const app = useAppStore();
    const { clearMenu, isOpen, openContextMenu } = useMenu();
    const expression = app.expressions.get(id);
    const imageUrl = expression?.url || url;

    return (
      <>
        <EmojiWrapper
          {...attributes}
          onClick={(event) => {
            if (!expression) return;
            if (isOpen) return clearMenu();
            const rect = event.currentTarget.getBoundingClientRect();

            openContextMenu(
              event,
              {
                id: `custom-emoji-${id}`,
                type: "custom"
              },
              {
                x: Math.round(rect.left - 55),
                y: Math.round(rect.bottom - 200)
              }
            );
          }}
          isEmojiOnly={isEmojiOnly}
        >
          {children}
          <EmojiImage
            src={imageUrl}
            alt={id}
            draggable={false}
            aria-label={`<${animated ? "a" : ""}:${name}:${id}>`}
          />
        </EmojiWrapper>
        {expression && (
          <Portal>
            <ContextMenu padding={0} id={`custom-emoji-${id}`}>
              <CustomEmojiPreviewPopup expression={expression} />
            </ContextMenu>
          </Portal>
        )}
      </>
    );
  }
);

export { CustomEmoji };
