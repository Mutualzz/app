import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { useGoogleFont } from "@hooks/useGoogleFont";
import {
  DEFAULT_FONT_FAMILY,
  formatColor,
  getFontByFamily,
  isCustomFontRef,
  resolveFontFamilyCss,
  searchFonts
} from "@mutualzz/ui-core";
import { isValidWebFontFamilyName } from "@mutualzz/validators";
import { Box, Button, Input, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  MagnifyingGlassIcon,
  UploadSimpleIcon,
  XIcon
} from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
    label,
    description,
    fontOwnerId
  }: Props) => {
    const { t } = useTranslation("common");
    const { t: tSettings } = useTranslation("settings");
    const { theme } = useTheme();
    const resolvedLabel = label ?? tSettings("fonts.label");
    const outlinedBorder = formatColor(theme.colors.neutral, {
      alpha: 30,
      format: "hexa"
    });
    const neutralSoftBg = formatColor(theme.colors.neutral, {
      alpha: 10,
      format: "hexa"
    });
    const primarySoftBg = formatColor(theme.colors.primary, {
      alpha: 10,
      format: "hexa"
    });
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
        toast.error(tSettings("fonts.signInToUpload"));
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
          result.displayName ?? file.name.replace(/\.(woff2|woff|ttf|otf)$/i, "")
        );
        onChange(result.fontFamily);
        toast.success(tSettings("fonts.uploadedSuccess"));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : tSettings("fonts.uploadFailed")
        );
      } finally {
        setUploading(false);
        if (uploadRef.current) uploadRef.current.value = "";
      }
    };

    const previewLabel = (() => {
      if (isCustomFontRef(resolvedValue)) {
        return customLabel
          ? tSettings("fonts.uploadedNamed", { name: customLabel })
          : tSettings("fonts.uploaded");
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
            {resolvedLabel}
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
          placeholder={tSettings("fonts.searchPlaceholder")}
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
            border: `1px solid ${outlinedBorder}`
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
                    ? primarySoftBg
                    : undefined,
                "&:hover": {
                  background: neutralSoftBg
                }
              }}
            >
              <Typography level="body-sm" fontWeight={600}>
                {tSettings("fonts.defaultOption", {
                  family: DEFAULT_FONT_FAMILY
                })}
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
                    ? primarySoftBg
                    : undefined,
                "&:hover": {
                  background: neutralSoftBg
                }
              }}
            >
              <Typography level="body-sm" fontWeight={600}>
                {tSettings("fonts.useQuoted", { name: trimmedQuery })}
              </Typography>
              <Typography level="body-xs" css={{ opacity: 0.55 }}>
                {tSettings("fonts.loadFromProvider")}
              </Typography>
            </Box>
          )}

          {filteredFonts.length === 0 && !showCustomWebFont ? (
            <Typography
              level="body-xs"
              css={{ opacity: 0.65, px: 0.75, py: 0.5 }}
            >
              {trimmedQuery
                ? tSettings("fonts.noMatch", { query: trimmedQuery })
                : tSettings("fonts.noFonts")}
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
                      ? primarySoftBg
                      : undefined,
                    "&:hover": {
                      background: selected
                        ? primarySoftBg
                        : neutralSoftBg
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
            accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
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
            {t("uploadCustomFont")}
          </Button>
          <Typography level="body-xs" css={{ opacity: 0.55, lineHeight: 1.4 }}>
            {tSettings("fonts.uploadHint")}
          </Typography>
        </Stack>

        <Stack
          direction="column"
          spacing={0.5}
          p={1.25}
          css={{
            borderRadius: 10,
            border: `1px solid ${outlinedBorder}`,
            background: neutralSoftBg
          }}
        >
          <Typography level="body-xs" css={{ opacity: 0.6 }}>
            {tSettings("fonts.preview")}
          </Typography>
          <Typography
            level="title-md"
            css={{
              fontFamily: fontFamily ?? resolveFontFamilyCss(resolvedValue)
            }}
          >
            {tSettings("fonts.pangram")}
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
            {tSettings("fonts.resetToDefault")}
          </Typography>
        )}
      </Stack>
    );
  }
);
