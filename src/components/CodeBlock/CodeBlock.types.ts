import type { BundledLanguage } from "shiki";

export interface CodeBlockProps {
    code: string;
    language?: BundledLanguage | "plaintext";
}
