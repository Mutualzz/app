import { Button } from "@components/Button";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { formatColor } from "@mutualzz/ui-core";
import type { APIChangelog } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { SparkleIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const WHATS_NEW_MODAL_ID = "whats-new";

interface WhatsNewModalProps {
  changelog: APIChangelog;
  onAck: () => Promise<void> | void;
}

export const WhatsNewModal = observer(
  ({ changelog, onAck }: WhatsNewModalProps) => {
    const { t } = useTranslation("common");
    const app = useAppStore();
    const { theme } = useTheme();
    const { closeModal } = useModal();

    const handleAck = async () => {
      await onAck();
      closeModal(WHATS_NEW_MODAL_ID);
    };

    const surface = formatColor(theme.colors.surface, { format: "hexa" });
    const primarySoft = formatColor(theme.colors.primary, {
      alpha: 12,
      format: "hexa"
    });
    const primarySoftBorder = formatColor(theme.colors.primary, {
      alpha: 26,
      format: "hexa"
    });
    const primaryText = formatColor(theme.colors.primary);
    const metaPillBg = formatColor(theme.colors.neutral, {
      alpha: 12,
      format: "hexa"
    });
    const footerBorder = formatColor(theme.typography.colors.muted, {
      alpha: 14,
      format: "hexa"
    });
    const bodyWell = formatColor(theme.colors.neutral, {
      alpha: 6,
      format: "hexa"
    });
    const heroFade = `linear-gradient(to top, ${surface} 0%, ${formatColor(theme.colors.surface, { alpha: 55, format: "hexa" })} 42%, ${formatColor(theme.colors.surface, { alpha: 0, format: "hexa" })} 100%)`;
    const version = changelog.desktopVersion;
    const hasImage = Boolean(changelog.imageUrl);

    return (
      <Paper
        p={0}
        overflow="hidden"
        maxWidth={600}
        width="100%"
        direction="column"
        borderRadius={20}
        elevation={app.settings?.preferEmbossed ? 5 : 3}
        color="neutral"
        transparency={0}
      >
        {hasImage ? (
          <Stack
            width="100%"
            position="relative"
            overflow="hidden"
            css={{ flexShrink: 0 }}
          >
            <img
              src={changelog.imageUrl!}
              alt=""
              css={{
                display: "block",
                width: "100%",
                height: 280,
                objectFit: "cover"
              }}
            />
            <Stack
              position="absolute"
              left={0}
              right={0}
              bottom={0}
              height={140}
              css={{
                background: heroFade,
                pointerEvents: "none"
              }}
            />
            <Stack
              position="absolute"
              left={0}
              right={0}
              bottom={0}
              direction="column"
              spacing={1}
              px={3.25}
              pb={2.25}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                flexWrap="wrap"
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  px={1.1}
                  py={0.4}
                  borderRadius={999}
                  css={{
                    backgroundColor: primarySoft,
                    border: `1px solid ${primarySoftBorder}`,
                    color: primaryText,
                    backdropFilter: "blur(8px)"
                  }}
                >
                  <SparkleIcon size={13} weight="fill" />
                  <Typography
                    level="body-xs"
                    fontWeight={700}
                    css={{ color: "inherit", letterSpacing: "0.03em" }}
                  >
                    {t("whatsNew.title")}
                  </Typography>
                </Stack>

                <Typography level="body-xs" textColor="muted" fontWeight={500}>
                  {dayjs(changelog.publishedAt).format("MMM D, YYYY")}
                </Typography>

                {version ? (
                  <Stack
                    px={0.9}
                    py={0.35}
                    borderRadius={999}
                    css={{
                      backgroundColor: metaPillBg,
                      backdropFilter: "blur(8px)"
                    }}
                  >
                    <Typography
                      level="body-xs"
                      textColor="muted"
                      fontWeight={600}
                    >
                      v{version}
                    </Typography>
                  </Stack>
                ) : null}
              </Stack>

              <Typography
                level="h4"
                fontWeight={700}
                css={{ lineHeight: 1.2, letterSpacing: "-0.02em" }}
              >
                {changelog.title}
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Stack
            width="100%"
            direction="column"
            alignItems="flex-start"
            spacing={1}
            px={3.25}
            pt={3.25}
            pb={1}
            css={{
              flexShrink: 0,
              background: `radial-gradient(90% 120% at 12% -10%, ${primarySoft} 0%, transparent 58%), radial-gradient(70% 90% at 100% 0%, ${formatColor(theme.colors.primary, { alpha: 8, format: "hexa" })} 0%, transparent 55%)`
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              flexWrap="wrap"
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                px={1.1}
                py={0.4}
                borderRadius={999}
                css={{
                  backgroundColor: primarySoft,
                  border: `1px solid ${primarySoftBorder}`,
                  color: primaryText
                }}
              >
                <SparkleIcon size={13} weight="fill" />
                <Typography
                  level="body-xs"
                  fontWeight={700}
                  css={{ color: "inherit", letterSpacing: "0.03em" }}
                >
                  {t("whatsNew.title")}
                </Typography>
              </Stack>

              <Typography level="body-xs" textColor="muted" fontWeight={500}>
                {dayjs(changelog.publishedAt).format("MMM D, YYYY")}
              </Typography>

              {version ? (
                <Stack
                  px={0.9}
                  py={0.35}
                  borderRadius={999}
                  css={{ backgroundColor: metaPillBg }}
                >
                  <Typography
                    level="body-xs"
                    textColor="muted"
                    fontWeight={600}
                  >
                    v{version}
                  </Typography>
                </Stack>
              ) : null}
            </Stack>

            <Typography
              level="h4"
              fontWeight={700}
              css={{ lineHeight: 1.2, letterSpacing: "-0.02em" }}
            >
              {changelog.title}
            </Typography>
          </Stack>
        )}

        <Stack direction="column" spacing={2.25} px={3.25} pt={hasImage ? 0.5 : 1.75} pb={3}>
          <Stack
            maxHeight={360}
            overflow="auto"
            direction="column"
            p={1.75}
            borderRadius={14}
            css={{
              width: "100%",
              backgroundColor: bodyWell,
              border: `1px solid ${footerBorder}`
            }}
          >
            <MarkdownRenderer value={changelog.body} />
          </Stack>

          <Stack
            pt={0.25}
            css={{
              borderTop: `1px solid ${footerBorder}`
            }}
          >
            <Button
              variant="solid"
              color="primary"
              expand
              size="lg"
              onClick={() => void handleAck()}
              css={{
                marginTop: 14,
                minHeight: 46,
                borderRadius: 12,
                fontWeight: 700
              }}
            >
              {t("gotIt")}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    );
  }
);
