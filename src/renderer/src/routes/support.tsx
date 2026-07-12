import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { SupportHeader } from "@components/Support/SupportHeader";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import {
  ChatsCircleIcon,
  GavelIcon,
  LifebuoyIcon,
  ShieldWarningIcon,
  TrashIcon
} from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/support")({
  component: SupportPage
});

const SUPPORT_EMAIL = "contact@mutualzz.com";

const faqKeys = ["report", "appeal", "delete", "block"] as const;

const quickLinkItems = [
  {
    key: "report" as const,
    icon: <ShieldWarningIcon size={18} />
  },
  {
    key: "appeals" as const,
    icon: <GavelIcon size={18} />
  },
  {
    key: "delete" as const,
    icon: <TrashIcon size={18} />
  }
];

function SupportPage() {
  const { t } = useTranslation("common");
  const { t: tSettings } = useTranslation("settings");
  const app = useAppStore();
  const navigate = useNavigate();
  const isLoggedIn = !!app.token;

  return (
    <Stack width="100vw" height="100dvh" direction="column" overflow="hidden">
      <SupportHeader
        title={tSettings("helpAndSupport")}
        icon={<LifebuoyIcon size={22} weight="fill" />}
        showExit={isLoggedIn}
      />

      <Stack
        flex={1}
        overflow="auto"
        justifyContent="center"
        alignItems="center"
        direction="column"
        py={{ xs: 4, sm: 8 }}
      >
        <Paper
          width="100%"
          maxWidth="760px"
          borderRadius={16}
          boxShadow={2}
          px={{ xs: 5, sm: 8 }}
          py={{ xs: 7, sm: 12 }}
          overflow="auto"
          direction="column"
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Typography level="h3">{tSettings("helpAndSupport")}</Typography>
          </Stack>

          <Typography level="body-lg" textColor="muted">
            {t("support.pageIntro")}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {isLoggedIn ? (
              <>
                <Button
                  startDecorator={<ChatsCircleIcon />}
                  onClick={() => navigate({ to: "/support/tickets" })}
                >
                  {t("support.myTickets")}
                </Button>
                <Button
                  variant="soft"
                  onClick={() =>
                    navigate({ to: "/support/tickets", search: { new: true } })
                  }
                >
                  {t("support.contactSupport")}
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate({ to: "/login" })}>
                {t("support.loginToContact")}
              </Button>
            )}
            <Button variant="soft" onClick={() => navigate({ to: "/privacy" })}>
              {t("support.privacyPolicy")}
            </Button>
            <Button variant="soft" onClick={() => navigate({ to: "/tos" })}>
              {t("support.termsOfService")}
            </Button>
          </Stack>

          <Section title={t("support.faq")}>
            <Stack direction="column" spacing={2}>
              {faqKeys.map((key) => (
                <Paper
                  key={key}
                  variant="soft"
                  borderRadius={12}
                  p={2}
                  direction="column"
                  spacing={0.75}
                >
                  <Typography fontWeight={600}>
                    {t(`support.faqItems.${key}.q`)}
                  </Typography>
                  <Typography level="body-sm" textColor="muted">
                    {t(`support.faqItems.${key}.a`)}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Section>

          <Section title={t("support.quickLinks")}>
            <Stack direction="column" spacing={1}>
              {quickLinkItems.map((item) => (
                <QuickLink
                  key={item.key}
                  icon={item.icon}
                  label={t(`support.quickLinkItems.${item.key}.label`)}
                  hint={t(`support.quickLinkItems.${item.key}.hint`)}
                />
              ))}
            </Stack>
          </Section>

          <Section title={t("support.contactUs")}>
            <Typography>
              {isLoggedIn
                ? t("support.contactEmailLoggedIn", { email: SUPPORT_EMAIL })
                : t("support.contactEmailGuest", { email: SUPPORT_EMAIL })}
            </Typography>
          </Section>
        </Paper>
      </Stack>
    </Stack>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack direction="column" spacing={1.5} width="100%" mt={2}>
      <Typography level="h6">{title}</Typography>
      {children}
    </Stack>
  );
}

function QuickLink({
  icon,
  label,
  hint
}: {
  icon: ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      {icon}
      <Stack direction="column" spacing={0.25}>
        <Typography fontWeight={600}>{label}</Typography>
        <Typography level="body-sm" textColor="muted">
          {hint}
        </Typography>
      </Stack>
    </Stack>
  );
}
