import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { useGoogleFont } from "@hooks/useGoogleFont";
import {
  DEFAULT_FONT_FAMILY,
  getFontByFamily,
  isCustomFontRef,
  resolveFontFamilyCss,
  searchFonts
} from "@mutualzz/ui-core";
import { isValidWebFontFamilyName } from "@mutualzz/validators";
import { Box, Button, Input, Stack, Typography } from "@mutualzz/ui-web";
import {
  MagnifyingGlassIcon,
  UploadSimpleIcon,
  XIcon
} from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { observer } from "mobx-react-lite";

interface Props {
  value: string | null | undefined;
  onChange: (family: string | null) => void;
  allowClear?: boolean;
  label?: string;
  description?: string;
  fontOwnerId?: string | null;
}

const providerLabel = (provider: "google" | "fontshare") =>
  provider === "fontshare" ? "Fontshare" : "Google / Bunny";

export const GoogleFontPicker = observer(
  ({
    value,
    onChange,
    allowClear = true,
    label = "Font",
    description,
    fontOwnerId
  }: Props) => {
    const app = useAppStore();
    const uploadRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [uploading, setUploading] = useState(false);
    const [customLabel, setCustomLabel] = useState<string | null>(null);

    const ownerId = fontOwnerId ?? app.account?.id ?? null;
    const resolvedValue = value ?? DEFAULT_FONT_FAMILY;
    const { fontFamily } = useGoogleFont(resolvedValue, ownerId);

    const filteredFonts = searchFonts(query);
    const selectedFont = getFontByFamily(resolvedValue);
    const trimmedQuery = query.trim();
    const showCustomWebFont =
      trimmedQuery.length > 0 &&
      !selectedFont &&
      isValidWebFontFamilyName(trimmedQuery) &&
      !filteredFonts.some(
        (font) => font.family.toLowerCase() === trimmedQuery.toLowerCase()
      );

    const uploadFont = async (file: File) => {
      if (!ownerId) {
        toast.error("Sign in to upload a custom font");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await app.rest.postFormData<{
          hash: string;
          fontFamily: string;
          displayName?: string;
        }>("/@me/profile/assets", formData, { type: "font" });

        if (!result?.fontFamily) {
          throw new Error("No font reference returned");
        }

        setCustomLabel(
          result.displayName ?? file.name.replace(/\.woff2$/i, "")
        );
        onChange(result.fontFamily);
        toast.success("Font uploaded");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload font"
        );
      } finally {
        setUploading(false);
        if (uploadRef.current) uploadRef.current.value = "";
      }
    };

    const previewLabel = (() => {
      if (isCustomFontRef(resolvedValue)) {
        return customLabel ? `Uploaded · ${customLabel}` : "Uploaded font";
      }
      if (selectedFont) {
        return `${providerLabel(selectedFont.provider)} · ${selectedFont.category}`;
      }
      return resolvedValue;
    })();

    return (
      <Stack direction="column" spacing={1.25}>
        <Stack direction="column" spacing={0.35}>
          <Typography level="body-xs" fontWeight={600} css={{ opacity: 0.85 }}>
            {label}
          </Typography>
          {description && (
            <Typography
              level="body-xs"
              css={{ opacity: 0.55, lineHeight: 1.4 }}
            >
              {description}
            </Typography>
          )}
        </Stack>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fonts or type a Google Font name…"
          startDecorator={<MagnifyingGlassIcon />}
          endDecorator={
            query ? (
              <XIcon css={{ cursor: "pointer" }} onClick={() => setQuery("")} />
            ) : undefined
          }
          type="text"
        />

        <Paper
          variant="plain"
          borderRadius={10}
          p={0.75}
          direction="column"
          spacing={0.35}
          css={{
            maxHeight: 240,
            overflow: "auto",
            border: "1px solid var(--mz-palette-neutral-outlinedBorder)"
          }}
        >
          {allowClear && !query.trim() && (
            <Box
              px={1}
              py={0.75}
              borderRadius={8}
              onClick={() => onChange(DEFAULT_FONT_FAMILY)}
              css={{
                cursor: "pointer",
                background:
                  resolvedValue === DEFAULT_FONT_FAMILY
                    ? "var(--mz-palette-primary-softBg)"
                    : undefined,
                "&:hover": {
                  background: "var(--mz-palette-neutral-softBg)"
                }
              }}
            >
              <Typography level="body-sm" fontWeight={600}>
                Default ({DEFAULT_FONT_FAMILY})
              </Typography>
            </Box>
          )}

          {showCustomWebFont && (
            <Box
              px={1}
              py={0.75}
              borderRadius={8}
              onClick={() => onChange(trimmedQuery)}
              css={{
                cursor: "pointer",
                background:
                  resolvedValue.toLowerCase() === trimmedQuery.toLowerCase()
                    ? "var(--mz-palette-primary-softBg)"
                    : undefined,
                "&:hover": {
                  background: "var(--mz-palette-neutral-softBg)"
                }
              }}
            >
              <Typography level="body-sm" fontWeight={600}>
                Use &ldquo;{trimmedQuery}&rdquo;
              </Typography>
              <Typography level="body-xs" css={{ opacity: 0.55 }}>
                Load from Google / Bunny Fonts
              </Typography>
            </Box>
          )}

          {filteredFonts.length === 0 && !showCustomWebFont ? (
            <Typography
              level="body-xs"
              css={{ opacity: 0.65, px: 0.75, py: 0.5 }}
            >
              {trimmedQuery
                ? `No catalog fonts match "${trimmedQuery}"`
                : "No fonts to show"}
            </Typography>
          ) : (
            filteredFonts.map((font) => {
              const selected = font.family === resolvedValue;

              return (
                <Box
                  key={font.id}
                  px={1}
                  py={0.75}
                  borderRadius={8}
                  onClick={() => onChange(font.family)}
                  css={{
                    cursor: "pointer",
                    background: selected
                      ? "var(--mz-palette-primary-softBg)"
                      : undefined,
                    "&:hover": {
                      background: selected
                        ? "var(--mz-palette-primary-softBg)"
                        : "var(--mz-palette-neutral-softBg)"
                    }
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography
                      level="body-sm"
                      fontWeight={selected ? 700 : 500}
                    >
                      {font.family}
                    </Typography>
                    <Typography
                      level="body-xs"
                      css={{ opacity: 0.55, flexShrink: 0 }}
                    >
                      {providerLabel(font.provider)}
                    </Typography>
                  </Stack>
                  <Typography level="body-xs" css={{ opacity: 0.5 }}>
                    {font.category}
                  </Typography>
                </Box>
              );
            })
          )}
        </Paper>

        <Stack direction="column" spacing={0.75}>
          <input
            ref={uploadRef}
            type="file"
            accept=".woff2,font/woff2"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadFont(file);
            }}
          />
          <Button
            variant="outlined"
            color="neutral"
            size="sm"
            loading={uploading}
            disabled={!ownerId}
            startDecorator={<UploadSimpleIcon />}
            onClick={() => uploadRef.current?.click()}
          >
            Upload custom font (.woff2)
          </Button>
          <Typography level="body-xs" css={{ opacity: 0.55, lineHeight: 1.4 }}>
            WOFF2 only, up to 2 MB. Loads on demand when your theme or profile
            is viewed.
          </Typography>
        </Stack>

        <Stack
          direction="column"
          spacing={0.5}
          p={1.25}
          css={{
            borderRadius: 10,
            border: "1px solid var(--mz-palette-neutral-outlinedBorder)",
            background: "var(--mz-palette-neutral-softBg)"
          }}
        >
          <Typography level="body-xs" css={{ opacity: 0.6 }}>
            Preview
          </Typography>
          <Typography
            level="title-md"
            css={{
              fontFamily: fontFamily ?? resolveFontFamilyCss(resolvedValue)
            }}
          >
            The quick brown fox jumps over the lazy dog
          </Typography>
          <Typography
            level="body-sm"
            css={{
              fontFamily: fontFamily ?? resolveFontFamilyCss(resolvedValue),
              opacity: 0.8
            }}
          >
            {previewLabel}
          </Typography>
        </Stack>

        {allowClear && value && value !== DEFAULT_FONT_FAMILY && (
          <Typography
            level="body-xs"
            css={{
              opacity: 0.7,
              cursor: "pointer",
              width: "fit-content",
              "&:hover": { opacity: 1 }
            }}
            onClick={() => onChange(null)}
          >
            Reset to default
          </Typography>
        )}
      </Stack>
    );
  }
);
