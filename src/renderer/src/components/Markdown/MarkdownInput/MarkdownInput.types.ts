import type { CSSObject } from "@emotion/react";
import type {
  Color,
  ColorLike,
  Responsive,
  TypographyColor,
  Variant
} from "@mutualzz/ui-core";
import type { Expression } from "@stores/objects/Expression";
import type { KeyboardEvent } from "react";
import type { Editor } from "slate";

export interface MarkdownInputProps {
  color?: Responsive<Color | ColorLike>;
  textColor?: Responsive<TypographyColor | ColorLike | "inherit">;
  variant?: Responsive<Variant>;
  autoFocus?: boolean;

  emoticons?: boolean;
  hoverToolbar?: boolean;
  emojiPicker?: boolean;
  gifPicker?: boolean;
  stickerPicker?: boolean;
  mentions?: boolean;

  disabled?: boolean;

  value?: string;
  onChange?: (value: string, editor: Editor) => void;
  onKeyDown?: (event: KeyboardEvent, editor: Editor) => void;
  onSendMessage?: (message?: string) => void;
  onSelectSticker?: (sticker: Expression) => void;

  placeholder?: string | null;
  maxLength?: number;

  css?: CSSObject;
}
