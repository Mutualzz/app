import type { BundledLanguage } from "shiki";

export type CodeBlockProps = {
    code: string;
    language?: BundledLanguage | "plaintext";
};
