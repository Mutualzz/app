import type { EmojiNode } from "./mdast";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            emoji: EmojiNode;
        }
    }
}
