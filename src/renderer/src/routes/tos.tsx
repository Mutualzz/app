import { Link } from "@components/Link";
import { Paper } from "@components/Paper";
import { Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createFileRoute("/tos")({
  component: TermsOfService
});

function TermsOfService() {
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
            Terms of Service for Mutualzz
          </Typography>
          <Typography level="body-lg" mb={5}>
            Effective Date: July 11, 2026
          </Typography>
          <Typography mb={7}>
            These Terms of Service (“Terms”) govern your access to and use of
            Mutualzz’s website, desktop and mobile apps, voice features,
            Minecraft bridge tools, and related services (collectively, the
            “Service”). By creating an account or using Mutualzz, you agree to
            these Terms and our{" "}
            <Link href="/privacy" textColor="accent" underline="hover">
              Privacy Policy
            </Link>
            . If you do not agree, do not use the Service.
          </Typography>

          <Section
            title="1. Who We Are"
            mt={24}
            content={
              <Typography>
                Mutualzz (“we,” “our,” or “us”) provides a social platform where
                people can share Feed content, join Spaces, message others, use
                voice/video features, and optionally connect Minecraft servers or
                Discord through our bridge tools. Contact:{" "}
                <Link
                  textColor="accent"
                  underline="hover"
                  href="mailto:contact@mutualzz.com"
                >
                  contact@mutualzz.com
                </Link>
                .
              </Typography>
            }
          />

          <Section
            title="2. Eligibility"
            content={
              <Stack direction="column" pl={6} spacing={1.5}>
                <Typography>
                  • You must be at least 13 years old (or the minimum digital
                  consent age in your country, if higher) to use Mutualzz.
                </Typography>
                <Typography>
                  • If you use the Service on behalf of an organization, you
                  represent that you have authority to bind that organization to
                  these Terms.
                </Typography>
                <Typography>
                  • You are responsible for complying with laws that apply to
                  you, including any age, privacy, and online safety rules in
                  your region.
                </Typography>
              </Stack>
            }
          />

          <Section
            title="3. Accounts"
            content={
              <Stack direction="column" pl={6} spacing={1.5}>
                <Typography>
                  • You must provide accurate registration information and keep
                  it up to date.
                </Typography>
                <Typography>
                  • You are responsible for activity under your account and for
                  keeping your credentials secure. Notify us promptly if you
                  believe your account has been compromised.
                </Typography>
                <Typography>
                  • We may require verification (such as email confirmation) and
                  may refuse, suspend, or reclaim usernames that violate these
                  Terms or impersonate others.
                </Typography>
                <Typography>
                  • One person should not create accounts to evade enforcement,
                  spam, or otherwise abuse the Service.
                </Typography>
              </Stack>
            }
          />

          <Section
            title="4. The Service"
            content={
              <Stack direction="column" spacing={2}>
                <Typography>
                  Mutualzz may include features such as:
                </Typography>
                <Stack direction="column" pl={6} spacing={1.5}>
                  <Typography>
                    • <b>Feed:</b> posts, media, comments, likes, and related
                    social features.
                  </Typography>
                  <Typography>
                    • <b>Spaces:</b> community spaces with channels, roles,
                    permissions, invites, and shared media.
                  </Typography>
                  <Typography>
                    • <b>Messaging:</b> direct messages and group DMs.
                  </Typography>
                  <Typography>
                    • <b>Voice & media:</b> real-time voice (and related
                    features such as screen sharing where available).
                  </Typography>
                  <Typography>
                    • <b>Bridges & integrations:</b> optional Minecraft server
                    linking, Discord relays, and third-party embeds or widgets
                    (for example music or GIF providers).
                  </Typography>
                </Stack>
                <Typography>
                  Features may change, be limited, or be unavailable at times.
                  Mutualzz is provided on an “as available” basis and may be
                  under active development (including Early Access features).
                </Typography>
              </Stack>
            }
          />

          <Section
            title="5. Your Content"
            content={
              <Stack direction="column" pl={6} spacing={1.5}>
                <Typography>
                  • You retain ownership of content you create and share
                  (“User Content”), subject to the rights you grant below and
                  any rights of others in that content.
                </Typography>
                <Typography>
                  • By uploading or sharing User Content, you grant Mutualzz a
                  worldwide, non-exclusive, royalty-free license to host, store,
                  reproduce, modify (for technical purposes such as resizing),
                  display, perform, and distribute that content as needed to
                  operate, improve, promote, and secure the Service.
                </Typography>
                <Typography>
                  • You represent that you have the rights needed to share your
                  User Content and that it does not violate law or these Terms.
                </Typography>
                <Typography>
                  • Content you delete may remain in backups, caches, or copies
                  already shared, saved, or relayed through bridges before
                  deletion.
                </Typography>
              </Stack>
            }
          />

          <Section
            title="6. Acceptable Use"
            content={
              <Stack direction="column" spacing={2}>
                <Typography>You agree not to:</Typography>
                <Stack direction="column" pl={6} spacing={1.5}>
                  <Typography>
                    • Harass, threaten, stalk, dox, or otherwise harm people.
                  </Typography>
                  <Typography>
                    • Post or share illegal content, including child sexual
                    exploitation material, terrorist content, or content that
                    facilitates serious crime.
                  </Typography>
                  <Typography>
                    • Share non-consensual intimate imagery, extreme gore used
                    to shock or harass, or content that promotes self-harm in a
                    prohibited way.
                  </Typography>
                  <Typography>
                    • Infringe intellectual property, privacy, or publicity
                    rights.
                  </Typography>
                  <Typography>
                    • Spam, scam, phish, or engage in fraudulent or deceptive
                    schemes.
                  </Typography>
                  <Typography>
                    • Impersonate others or misrepresent your affiliation.
                  </Typography>
                  <Typography>
                    • Attempt to gain unauthorized access to accounts, systems,
                    networks, or non-public areas of the Service.
                  </Typography>
                  <Typography>
                    • Probe, scrape, crawl, or overload the Service in ways that
                    harm performance or security, except as allowed by a written
                    agreement with us.
                  </Typography>
                  <Typography>
                    • Reverse engineer, interfere with, or circumvent security,
                    rate limits, or access controls, except where applicable law
                    expressly allows it.
                  </Typography>
                  <Typography>
                    • Use bots, scripts, or automation to abuse features, farm
                    engagement, or evade moderation—except for official Mutualzz
                    bots, documented bridge plugins/mods, or uses we expressly
                    permit.
                  </Typography>
                  <Typography>
                    • Use Minecraft or Discord bridges to relay prohibited
                    content, spam other platforms, or violate those platforms’
                    rules.
                  </Typography>
                  <Typography>
                    • Sell, rent, or commercially exploit Mutualzz access or
                    APIs without our prior written permission.
                  </Typography>
                </Stack>
              </Stack>
            }
          />

          <Section
            title="7. Spaces, Moderation & Enforcement"
            content={
              <Stack direction="column" pl={6} spacing={1.5}>
                <Typography>
                  • Space owners and moderators may set additional rules for
                  their Spaces, so long as those rules do not conflict with these
                  Terms.
                </Typography>
                <Typography>
                  • We may review reports and limited surrounding context (for
                  example nearby messages) when investigating safety or policy
                  issues. Staff do not browse private conversations outside that
                  investigative need.
                </Typography>
                <Typography>
                  • We may remove content, restrict features, lock Spaces,
                  suspend or terminate accounts, or take other action we
                  reasonably believe is necessary to protect users, Mutualzz, or
                  third parties, or to comply with law.
                </Typography>
                <Typography>
                  • Where available, you may appeal certain enforcement actions
                  (such as Space lockdowns) through the process we provide.
                  Appeals are reviewed at our discretion.
                </Typography>
              </Stack>
            }
          />

          <Section
            title="8. Bridges, Minecraft & Third-Party Services"
            content={
              <Stack direction="column" pl={6} spacing={1.5}>
                <Typography>
                  • Optional integrations (Minecraft plugins/mods, Discord
                  bots/relays, Spotify/music widgets, GIF providers, hosting
                  providers, and similar services) are subject to those third
                  parties’ terms and privacy practices.
                </Typography>
                <Typography>
                  • If you link a Minecraft account or server, or enable a
                  Discord bridge, chat and related metadata may be relayed
                  between Mutualzz and those platforms according to the
                  configuration you (or a server admin) choose.
                </Typography>
                <Typography>
                  • You are responsible for configuring bridges lawfully and for
                  having authority to connect a server, guild, or account.
                </Typography>
                <Typography>
                  • We are not responsible for third-party outages, policy
                  changes, bans, or content once it leaves Mutualzz via a bridge
                  or embed.
                </Typography>
              </Stack>
            }
          />

          <Section
            title="9. Intellectual Property"
            content={
              <Stack direction="column" pl={6} spacing={1.5}>
                <Typography>
                  • Mutualzz, including its branding, software, design, and
                  documentation (excluding User Content), is owned by Mutualzz
                  and its licensors.
                </Typography>
                <Typography>
                  • Except for the limited right to use the Service under these
                  Terms, no rights are granted to you by implication or
                  otherwise.
                </Typography>
                <Typography>
                  • If you believe content on Mutualzz infringes your copyright,
                  contact{" "}
                  <Link
                    textColor="accent"
                    underline="hover"
                    href="mailto:contact@mutualzz.com"
                  >
                    contact@mutualzz.com
                  </Link>{" "}
                  with enough detail for us to locate and review the material.
                </Typography>
              </Stack>
            }
          />

          <Section
            title="10. Feedback"
            content={
              <Typography>
                If you send ideas, suggestions, or feedback, you grant us
                permission to use them without restriction or compensation.
              </Typography>
            }
          />

          <Section
            title="11. Disclaimers"
            content={
              <Typography>
                THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE
                MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES,
                EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT
                THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT
                CONTENT WILL BE ACCURATE OR AVAILABLE.
              </Typography>
            }
          />

          <Section
            title="12. Limitation of Liability"
            content={
              <Typography>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MUTUALZZ AND ITS
                AFFILIATES, OFFICERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE
                FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR
                PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, DATA, GOODWILL, OR
                BUSINESS OPPORTUNITY, ARISING FROM OR RELATED TO YOUR USE OF THE
                SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE
                TERMS OR THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE
                AMOUNT YOU PAID US (IF ANY) IN THE 12 MONTHS BEFORE THE CLAIM OR
                (B) USD $100. SOME JURISDICTIONS DO NOT ALLOW CERTAIN
                LIMITATIONS; IN THOSE CASES, OUR LIABILITY IS LIMITED TO THE
                FULLEST EXTENT PERMITTED BY LAW.
              </Typography>
            }
          />

          <Section
            title="13. Indemnification"
            content={
              <Typography>
                You agree to defend, indemnify, and hold harmless Mutualzz and
                its affiliates, officers, employees, and agents from claims,
                damages, losses, and expenses (including reasonable attorneys’
                fees) arising out of your User Content, your use of the Service,
                your bridges/integrations, or your violation of these Terms or
                applicable law.
              </Typography>
            }
          />

          <Section
            title="14. Termination"
            content={
              <Stack direction="column" pl={6} spacing={1.5}>
                <Typography>
                  • You may stop using Mutualzz at any time and may request
                  account deletion through the Service or by contacting us.
                </Typography>
                <Typography>
                  • We may suspend or terminate access immediately for
                  violations of these Terms, legal risk, or to protect the
                  Service or others.
                </Typography>
                <Typography>
                  • Provisions that by their nature should survive (including
                  licenses already granted to the extent needed for residual
                  copies, disclaimers, limitations of liability, and
                  indemnity) will survive termination.
                </Typography>
              </Stack>
            }
          />

          <Section
            title="15. Changes to These Terms"
            content={
              <Typography>
                We may update these Terms from time to time. If we make
                material changes, we will provide notice through the Service or
                other reasonable means. Continued use after the effective date
                of updated Terms constitutes acceptance of the changes, except
                where applicable law requires additional consent.
              </Typography>
            }
          />

          <Section
            title="16. General"
            content={
              <Stack direction="column" pl={6} spacing={1.5}>
                <Typography>
                  • These Terms are the entire agreement between you and
                  Mutualzz regarding the Service and supersede prior agreements
                  on the same subject.
                </Typography>
                <Typography>
                  • If any provision is unenforceable, the remaining provisions
                  remain in effect.
                </Typography>
                <Typography>
                  • Our failure to enforce a provision is not a waiver.
                </Typography>
                <Typography>
                  • You may not assign these Terms without our consent; we may
                  assign them in connection with a merger, acquisition, or sale
                  of assets.
                </Typography>
                <Typography>
                  • Nothing in these Terms limits non-waivable consumer rights
                  under applicable law.
                </Typography>
              </Stack>
            }
          />

          <Section
            title="17. Contact Us"
            my={0}
            content={
              <Typography>
                Questions about these Terms:
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
                Privacy Policy:{" "}
                <Link href="/privacy" textColor="accent" underline="hover">
                  mutualzz.com/privacy
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
