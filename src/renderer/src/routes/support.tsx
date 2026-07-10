import { Button } from "@components/Button";
import { Link } from "@components/Link";
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

export const Route = createFileRoute("/support")({
  component: SupportPage
});

const faqItems = [
  {
    question: "How do I report someone or content?",
    answer:
      "Open a user profile or post menu and choose Report. Reports go to our moderation team."
  },
  {
    question: "How do I appeal a ban?",
    answer:
      "If you received a ban email, use the appeal link in that message. Appeals are reviewed separately from support tickets."
  },
  {
    question: "How do I delete my account?",
    answer: "Go to Settings → My Account → Delete Account."
  },
  {
    question: "How do I block someone?",
    answer:
      "Open their profile and choose Block. Blocked users cannot send you direct messages, friend requests, or interact with your posts and comments. Their posts, comments, and profile are hidden from you, and your profile appears unavailable to them."
  }
];

function SupportPage() {
  const app = useAppStore();
  const navigate = useNavigate();
  const isLoggedIn = !!app.token;

  return (
    <Stack width="100vw" height="100dvh" direction="column" overflow="hidden">
      <SupportHeader
        title="Help & Support"
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
            <Typography level="h3">Help & Support</Typography>
          </Stack>

          <Typography level="body-lg" textColor="muted">
            Need help with Mutualzz? Browse common answers below or contact our
            team.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {isLoggedIn ? (
              <>
                <Button
                  startDecorator={<ChatsCircleIcon />}
                  onClick={() => navigate({ to: "/support/tickets" })}
                >
                  My tickets
                </Button>
                <Button
                  variant="soft"
                  onClick={() =>
                    navigate({ to: "/support/tickets", search: { new: true } })
                  }
                >
                  Contact support
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate({ to: "/login" })}>
                Log in to contact support
              </Button>
            )}
            <Button variant="soft" onClick={() => navigate({ to: "/privacy" })}>
              Privacy Policy
            </Button>
          </Stack>

          <Section title="Frequently asked questions">
            <Stack direction="column" spacing={2}>
              {faqItems.map((item) => (
                <Paper
                  key={item.question}
                  variant="soft"
                  borderRadius={12}
                  p={2}
                  direction="column"
                  spacing={0.75}
                >
                  <Typography fontWeight={600}>{item.question}</Typography>
                  <Typography level="body-sm" textColor="muted">
                    {item.answer}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Section>

          <Section title="Quick links">
            <Stack direction="column" spacing={1}>
              <QuickLink
                icon={<ShieldWarningIcon size={18} />}
                label="Report content or a user"
                hint="Available from profile and post menus inside the app"
              />
              <QuickLink
                icon={<GavelIcon size={18} />}
                label="Ban appeals"
                hint="Use the appeal link from your ban email"
              />
              <QuickLink
                icon={<TrashIcon size={18} />}
                label="Delete your account"
                hint="Settings → My Account → Delete Account"
              />
            </Stack>
          </Section>

          <Section title="Contact us">
            <Typography>
              Email us at{" "}
              <Link href="mailto:contact@mutualzz.com" textColor="accent">
                contact@mutualzz.com
              </Link>
              {isLoggedIn
                ? " or open a support ticket for a tracked conversation."
                : "."}
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
