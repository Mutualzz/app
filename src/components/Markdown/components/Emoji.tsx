import type { EmojiElement } from "@app-types/slate";
import { styled } from "@mutualzz/ui-core";

interface EmojiProps extends Omit<EmojiElement, "type" | "children"> {
    isEmojiOnly: boolean;
}

const EmojiWrapper = styled("span")<{ isEmojiOnly: boolean }>(
    ({ isEmojiOnly }) => ({
        display: "inline-block",
        width: isEmojiOnly ? "2.25em" : "1.375em",
        height: isEmojiOnly ? "2.25em" : "1.375em",
        verticalAlign: "middle",
    }),
);

const EmojiImage = styled("img")({
    width: "100%",
    height: "100%",
    objectFit: "contain",
});

const Emoji = ({ isEmojiOnly, url, unicode, name }: EmojiProps) => {
    return (
        <EmojiWrapper isEmojiOnly={isEmojiOnly}>
            <EmojiImage
                src={url}
                alt={unicode}
                draggable={false}
                aria-label={`:${name}:`}
            />
        </EmojiWrapper>
    );
};

export { Emoji };
