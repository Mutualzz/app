import type { CustomEmojiElement } from "@app-types/slate";
import { styled } from "@mutualzz/ui-core";
import { ContextMenu } from "@components/ContextMenu.tsx";
import { CustomEmojiPreviewPopup } from "@components/Preview/CustomEmojiPreviewPopup.tsx";
import { Portal } from "@mutualzz/ui-web";
import { useMenu } from "@contexts/ContextMenu.context.tsx";

interface CustomEmojiProps extends Omit<
    CustomEmojiElement,
    "type" | "children"
> {
    isEmojiOnly: boolean;
}

const EmojiWrapper = styled("span")<{ isEmojiOnly: boolean }>(
    ({ isEmojiOnly }) => ({
        display: "inline-block",
        width: isEmojiOnly ? "2.25em" : "1.375em",
        height: isEmojiOnly ? "2.25em" : "1.375em",
        verticalAlign: "middle",
        cursor: "pointer",
    }),
);

const EmojiImage = styled("img")({
    width: "100%",
    height: "100%",
    objectFit: "contain",
});

const CustomEmoji = ({
    isEmojiOnly,
    url,
    name,
    id,
    animated,
}: CustomEmojiProps) => {
    const { clearMenu, isOpen, openContextMenu } = useMenu();

    return (
        <>
            <EmojiWrapper
                onClick={(event) => {
                    if (isOpen) return clearMenu();
                    const rect = event.currentTarget.getBoundingClientRect();

                    openContextMenu(
                        event,
                        {
                            id: `custom-emoji-${id}`,
                            type: "custom",
                        },
                        {
                            x: Math.round(rect.left - 55),
                            y: Math.round(rect.bottom - 200),
                        },
                    );
                }}
                isEmojiOnly={isEmojiOnly}
            >
                <EmojiImage
                    src={url}
                    alt={id}
                    draggable={false}
                    aria-label={`<${animated ? "a" : ""}:${name}:${id}>`}
                />
            </EmojiWrapper>
            <Portal>
                <ContextMenu padding={0} id={`custom-emoji-${id}`}>
                    <CustomEmojiPreviewPopup emojiId={id} />
                </ContextMenu>
            </Portal>
        </>
    );
};

export { CustomEmoji };
