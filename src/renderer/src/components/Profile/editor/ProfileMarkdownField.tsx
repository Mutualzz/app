import { MarkdownInput } from "@components/Markdown/MarkdownInput/MarkdownInput";
import { Stack, Typography } from "@mutualzz/ui-web";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: number;
}

export const ProfileMarkdownField = ({
  value,
  onChange,
  placeholder,
  maxLength,
  minHeight = 96
}: Props) => {
  const handleChange = (next: string) => {
    if (maxLength != null && next.length > maxLength) return;
    onChange(next);
  };

  return (
    <Stack direction="column" spacing={0.5}>
      <MarkdownInput
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        gifPicker={false}
        stickerPicker={false}
        mentions={false}
        css={{
          minHeight,
          alignItems: "flex-start",
          width: "100%"
        }}
      />
      {maxLength != null && (
        <Typography
          level="body-xs"
          css={{ opacity: 0.5, textAlign: "right" }}
        >
          {value.length}/{maxLength}
        </Typography>
      )}
    </Stack>
  );
};
