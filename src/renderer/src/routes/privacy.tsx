import { Link } from "@components/Link";
import { Paper } from "@components/Paper";
import { Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createFileRoute("/privacy")({
  component: Privacy
});

function Privacy() {
  return (
    // Legal copy is English-only for now; product UI is localized separately.
    // i18next-instrument-ignore
    <Stack
      width="100vw"
      minHeight="90vh"
      justifyContent="center"
      alignItems="center"
      direction="column"
      py={{ xs: 4, sm: 8 }}
    >
      <Paper
        width="100%"
        maxWidth="700px"
        borderRadius={16}
        boxShadow={2}
        px={{ xs: 5, sm: 8 }}
        py={{ xs: 7, sm: 12 }}
        overflow="auto"
        direction="column"
      >
        <Stack direction="column" spacing={0}>
          <Typography level="h3" mb={3}>
            Privacy Policy for Mutualzz
          </Typography>
          <Typography level="body-lg" mb={5}>
            Effective Date: July 11, 2026
          </Typography>
          <Typography mb={7}>
            Mutualzz (“we,” “our,” or “us”) values your privacy and is committed
            to protecting your personal information. This Privacy Policy
            explains how we collect, use, and safeguard your data when you use
            our website, desktop and mobile apps, voice features, Minecraft
            bridge tools, and related services (collectively, the “Service”).
            Use of Mutualzz is also governed by our{" "}
            <Link href="/tos" textColor="accent" underline="hover">
              Terms of Service
            </Link>
            .
          </Typography>

          <Section
            title="1. Information We Collect"
            mt={24}
            content={
              <Stack direction="column" spacing={2}>
                <Typography>
                  We collect information to provide, improve, and secure
                  Mutualzz. The types of data we may collect include:
                </Typography>
                <Stack direction="column" pl={6} spacing={1.5}>
                  <Typography fontWeight="bold">
                    a. Information You Provide
                  </Typography>
                  <Stack direction="column" pl={4} spacing={0.75}>
                    <Typography>
                      • <b>Account Information:</b> Username, email address,
                      password, date of birth, display name, and profile details
                      (such as bio, avatar, themes, and customization).
                    </Typography>
                    <Typography>
                      • <b>Content You Share:</b> Feed activity (posts, videos,
                      images, comments). Spaces activity (discussions, group
                      messages, shared media, and voice participation). Direct
                      messages, statuses, and reactions.
                    </Typography>
                    <Typography>
                      • <b>Support & Safety:</b> Messages you send to support,
                      appeals, and reports you submit about content or users.
                    </Typography>
                    <Typography>
                      • <b>Linked Services:</b> If you connect Minecraft (for
                      example via account linking codes) or Discord bridges, we
                      process identifiers and configuration needed to keep those
                      connections working, such as linked usernames, server IDs,
                      channel bindings, and relay settings.
                    </Typography>
                    <Typography>
                      • <b>Preferences:</b> Custom themes, color settings,
                      notification preferences, and accessibility options.
                    </Typography>
                  </Stack>
                  <Typography fontWeight="bold" mt={3}>
                    b. Information Collected Automatically
                  </Typography>
                  <Stack direction="column" pl={4} spacing={0.75}>
                    <Typography>
                      • <b>Usage Data:</b> Device info, IP address, browser
                      type, operating system, app version, and interactions with
                      the Service.
                    </Typography>
                    <Typography>
                      • <b>Voice & Real-Time Media:</b> When you join voice (or
                      related features such as screen sharing), audio/video is
                      transmitted to other participants for the session.
                      Technical connection metadata (such as join/leave events
                      and quality diagnostics) may be processed to operate the
                      feature.
                    </Typography>
                    <Typography>
                      • <b>Cookies & Local Storage:</b> Cookies, local storage,
                      and similar technologies for authentication, security,
                      preferences, and improving your experience.
                    </Typography>
                    <Typography>
                      • <b>Diagnostic Data:</b> Crash logs, performance
                      analytics, and error reports.
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            }
          />

          <Section
            title="2. How We Use Your Information"
            content={
              <Stack direction="column" pl={6} spacing={1.5}>
                <Typography>
                  • Providing and maintaining the Service.
                </Typography>
                <Typography>
                  • Personalizing your experience (custom themes, profiles).
                </Typography>
                <Typography>
                  • Enabling Feed, Spaces, messaging, voice, and optional
                  bridges/integrations.
                </Typography>
                <Typography>
                  • Verifying age eligibility and securing accounts.
                </Typography>
                <Typography>
                  • Protecting the security and integrity of the Service,
                  including reviewing reported content and limited surrounding
                  context (such as a few nearby messages in a direct message or
                  channel) when investigating safety reports.
                </Typography>
                <Typography>
                  • Monitoring usage and improving performance.
                </Typography>
                <Typography>
                  • Communicating with you about updates, features, security,
                  and support.
                </Typography>
                <Typography>• Complying with legal obligations.</Typography>
              </Stack>
            }
          />

          <Section
            title="3. Sharing of Information"
            content={
              <Stack direction="column" pl={6} spacing={3}>
                <Typography>
                  • <b>With Other Users:</b> Content you share is visible to
                  others depending on the context:
                </Typography>
                <Stack direction="column" pl={6} spacing={1.5}>
                  <Typography>
                    – In the Feed, your posts, media, and comments can be seen
                    by other users.
                  </Typography>
                  <Typography>
                    – In Spaces, your discussions, group contributions, media,
                    and voice activity can be seen/heard by members of that
                    Space (or channel participants).
                  </Typography>
                  <Typography>
                    – Direct messages are visible to participants in that
                    conversation.
                  </Typography>
                  <Typography>
                    – Statuses and reactions you post are visible across
                    profiles, the Feed, and Spaces according to feature design
                    and your settings.
                  </Typography>
                </Stack>
                <Typography>
                  • <b>Through Bridges:</b> If you or a server admin enable
                  Minecraft or Discord bridging, messages and related metadata
                  may be relayed to those platforms and become subject to their
                  visibility rules and policies.
                </Typography>
                <Typography>
                  • <b>With Service Providers:</b> Third-party vendors who help
                  us with hosting, content delivery, analytics, customer
                  support, push notifications, or security.
                </Typography>
                <Typography>
                  • <b>Third-Party Features You Choose:</b> Embeds and widgets
                  (such as music or GIF providers) may send requests to those
                  services when you use them. Their privacy policies apply to
                  data they receive.
                </Typography>
                <Typography>
                  • <b>For Legal Reasons:</b> If required by law, regulation,
                  legal process, or to protect rights, safety, and property.
                </Typography>
                <Typography>
                  • <b>In Business Transfers:</b> If Mutualzz undergoes a
                  merger, acquisition, or sale, your information may be
                  transferred.
                </Typography>
              </Stack>
            }
          />

          <Section
            title="4. User-Generated Content"
            content={
              <Stack direction="column" pl={6} spacing={1.5}>
                <Typography>
                  • <b>Visibility:</b> Depending on your privacy settings and
                  the feature you use, your content may be public, visible to
                  all members of a Space, visible to conversation participants,
                  or visible only to your connections.
                </Typography>
                <Typography>
                  • <b>Moderation:</b> If you report content, authorized Mutualzz
                  staff may review the reported item and a small amount of
                  nearby context to investigate the report. Staff do not browse
                  private conversations outside of reported content. Spaces may
                  be locked down or removed for policy violations; locked Space
                  owners can appeal by email where that process is available.
                </Typography>
                <Typography>
                  • <b>Responsibility:</b> You are responsible for the content
                  you share. We are not liable for how others use or interact
                  with the information you choose to make available.
                </Typography>
                <Typography>
                  • <b>Removal:</b> We reserve the right to remove content that
                  violates our{" "}
                  <Link href="/tos" textColor="accent" underline="hover">
                    Terms of Service
                  </Link>
                  , community guidelines, or applicable law.
                </Typography>
                <Typography>
                  • <b>Persistence:</b> Even if you delete content, copies may
                  remain visible to others if it was shared, saved, relayed
                  through a bridge, or otherwise distributed before deletion.
                </Typography>
              </Stack>
            }
          />

          <Section
            title="5. Your Choices & Controls"
            content={
              <Stack direction="column" pl={6} spacing={1.5}>
                <Typography>
                  • Account Settings: You can edit, update, or delete certain
                  information through your profile settings.
                </Typography>
                <Typography>
                  • Privacy Controls: Adjust what information is visible in your
                  profile, in the Feed, and within Spaces where those controls
                  are available.
                </Typography>
                <Typography>
                  • Bridges: You (or a server admin) can disconnect Minecraft or
                  Discord links and channel bindings you control.
                </Typography>
                <Typography>
                  • Cookies: Manage or disable cookies in your browser/app
                  settings (note that some features may not work without them).
                </Typography>
                <Typography>
                  • Account Deletion: You may request deletion of your account
                  and associated data at any time through the Service or by
                  contacting us.
                </Typography>
                <Typography>
                  • Depending on where you live, you may have rights to access,
                  correct, delete, or export personal data, or to object to or
                  restrict certain processing. Contact us to make a request.
                </Typography>
              </Stack>
            }
          />

          <Section
            title="6. Data Retention"
            content={
              <Typography>
                We retain your information as long as necessary to provide the
                Service, comply with obligations, resolve disputes, and enforce
                our agreements. When data is no longer needed, we delete or
                de-identify it. Backup copies may persist for a limited period
                after deletion.
              </Typography>
            }
          />

          <Section
            title="7. Security"
            content={
              <Typography>
                We use industry-standard safeguards to protect your data,
                including encryption in transit where appropriate, access
                controls, and monitoring. However, no method of storage or
                transmission is 100% secure.
              </Typography>
            }
          />

          <Section
            title="8. Children’s Privacy"
            content={
              <Typography>
                Mutualzz is not intended for users under 13 (or the minimum
                legal age in your jurisdiction, if higher). We do not knowingly
                collect data from children below that age. If we learn we have
                done so, we will delete it. Date of birth is collected to help
                enforce age eligibility.
              </Typography>
            }
          />

          <Section
            title="9. International Users"
            content={
              <Typography>
                Your information may be transferred and processed outside your
                country of residence, including in countries that may have
                different data-protection laws than your own. By using Mutualzz,
                you acknowledge such transfers as described in this Policy and
                as permitted by applicable law.
              </Typography>
            }
          />

          <Section
            title="10. Changes to This Policy"
            content={
              <Typography>
                We may update this Privacy Policy from time to time. If we make
                significant changes, we will notify you through the Service or
                other means. The “Effective Date” above shows when this Policy
                last changed.
              </Typography>
            }
          />

          <Section
            title="11. Contact Us"
            my={0}
            content={
              <Typography>
                If you have any questions, concerns, or requests regarding this
                Privacy Policy, please contact us at:
                <br />
                <b>Mutualzz</b>
                <br />
                Email:{" "}
                <Link
                  textColor="accent"
                  underline="hover"
                  href="mailto:contact@mutualzz.com"
                >
                  contact@mutualzz.com
                </Link>
                <br />
                Website:{" "}
                <Link
                  href="https://mutualzz.com"
                  textColor="accent"
                  underline="hover"
                >
                  mutualzz.com
                </Link>
                <br />
                Terms of Service:{" "}
                <Link href="/tos" textColor="accent" underline="hover">
                  mutualzz.com/tos
                </Link>
              </Typography>
            }
          />
        </Stack>
      </Paper>
    </Stack>
  );
}

function Section({
  title,
  content,
  mt,
  my = 6
}: {
  title: string;
  content: ReactNode;
  mt?: number;
  my?: number;
}) {
  return (
    <Stack spacing={6} width="100%" direction="column" my={my} mt={mt}>
      <Typography level="h6">{title}</Typography>
      {content}
    </Stack>
  );
}
