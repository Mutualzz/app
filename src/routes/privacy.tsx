import { Link, Paper, Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
    component: Privacy,
});

function Privacy() {
    return (
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
                        Effective Date: August 25, 2025
                    </Typography>
                    <Typography mb={7}>
                        Mutualzz (“we,” “our,” or “us”) values your privacy and
                        is committed to protecting your personal information.
                        This Privacy Policy explains how we collect, use, and
                        safeguard your data when you use our services, including
                        our website, mobile apps, and related services
                        (collectively, the “Service”).
                    </Typography>

                    <Section
                        title="1. Information We Collect"
                        mt={24}
                        content={
                            <Stack direction="column" spacing={2}>
                                <Typography>
                                    We collect information to provide, improve,
                                    and secure Mutualzz. The types of data we
                                    may collect include:
                                </Typography>
                                <Stack direction="column" pl={6} spacing={1.5}>
                                    <Typography fontWeight="bold">
                                        a. Information You Provide
                                    </Typography>
                                    <Stack
                                        direction="column"
                                        pl={4}
                                        spacing={0.75}
                                    >
                                        <Typography>
                                            • <b>Account Information:</b>{" "}
                                            Username, email address, password,
                                            and profile details (such as bio,
                                            avatar, themes, and customization).
                                        </Typography>
                                        <Typography>
                                            • <b>Content You Share:</b> Feed
                                            activity (posts, videos, images,
                                            comments — similar to
                                            TikTok/Instagram). Spaces activity
                                            (discussions, group messages, shared
                                            media, and voice chats — similar to
                                            Discord servers). Statuses and
                                            reactions you use across profiles,
                                            the Feed, and Spaces.
                                        </Typography>
                                        <Typography>
                                            • <b>Preferences:</b> Custom themes,
                                            color settings, and accessibility
                                            options.
                                        </Typography>
                                    </Stack>
                                    <Typography fontWeight="bold" mt={3}>
                                        b. Information Collected Automatically
                                    </Typography>
                                    <Stack
                                        direction="column"
                                        pl={4}
                                        spacing={0.75}
                                    >
                                        <Typography>
                                            • <b>Usage Data:</b> Device info, IP
                                            address, browser type, operating
                                            system, app version, and
                                            interactions with the Service.
                                        </Typography>
                                        <Typography>
                                            • <b>Cookies & Tracking:</b>{" "}
                                            Cookies, local storage, and similar
                                            technologies for authentication,
                                            security, and improving your
                                            experience.
                                        </Typography>
                                        <Typography>
                                            • <b>Diagnostic Data:</b> Crash
                                            logs, performance analytics, and
                                            error reports.
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
                                    • Personalizing your experience (custom
                                    themes, profiles).
                                </Typography>
                                <Typography>
                                    • Enabling you to share and interact through
                                    the Feed, participate in Spaces, and use
                                    statuses/reactions across the platform.
                                </Typography>
                                <Typography>
                                    • Protecting the security and integrity of
                                    the Service.
                                </Typography>
                                <Typography>
                                    • Monitoring usage and improving
                                    performance.
                                </Typography>
                                <Typography>
                                    • Communicating with you about updates,
                                    features, and support.
                                </Typography>
                                <Typography>
                                    • Complying with legal obligations.
                                </Typography>
                            </Stack>
                        }
                    />

                    <Section
                        title="3. Sharing of Information"
                        content={
                            <Stack direction="column" pl={6} spacing={3}>
                                <Typography>
                                    • <b>With Other Users:</b> Content you share
                                    is visible to others depending on the
                                    context:
                                </Typography>
                                <Stack direction="column" pl={6} spacing={1.5}>
                                    <Typography>
                                        – In the Feed, your posts, media, and
                                        comments can be seen by other users.
                                    </Typography>
                                    <Typography>
                                        – In Spaces, your discussions, group
                                        contributions, media, and voice activity
                                        can be seen/heard by members of that
                                        Space.
                                    </Typography>
                                    <Typography>
                                        – Statuses and reactions you post are
                                        visible across profiles, the Feed, and
                                        Spaces.
                                    </Typography>
                                </Stack>
                                <Typography>
                                    • <b>With Service Providers:</b> Third-party
                                    vendors who help us with hosting, analytics,
                                    customer support, or security.
                                </Typography>
                                <Typography>
                                    • <b>For Legal Reasons:</b> If required by
                                    law, regulation, legal process, or to
                                    protect rights, safety, and property.
                                </Typography>
                                <Typography>
                                    • <b>In Business Transfers:</b> If Mutualzz
                                    undergoes a merger, acquisition, or sale,
                                    your information may be transferred.
                                </Typography>
                            </Stack>
                        }
                    />

                    <Section
                        title="4. User-Generated Content"
                        content={
                            <Stack direction="column" pl={6} spacing={1.5}>
                                <Typography>
                                    • <b>Visibility:</b> Depending on your
                                    privacy settings, your content may be
                                    public, visible to all members of a Space,
                                    or visible only to your connections.
                                </Typography>
                                <Typography>
                                    • <b>Responsibility:</b> You are responsible
                                    for the content you share. We are not liable
                                    for how others use or interact with the
                                    information you choose to make available.
                                </Typography>
                                <Typography>
                                    • <b>Removal:</b> We reserve the right to
                                    remove content that violates our community
                                    guidelines, terms of service, or applicable
                                    law.
                                </Typography>
                                <Typography>
                                    • <b>Persistence:</b> Even if you delete
                                    content, copies may remain visible to others
                                    if it was shared, saved, or otherwise
                                    distributed before deletion.
                                </Typography>
                            </Stack>
                        }
                    />

                    <Section
                        title="5. Your Choices & Controls"
                        content={
                            <Stack direction="column" pl={6} spacing={1.5}>
                                <Typography>
                                    • Account Settings: You can edit, update, or
                                    delete your information through your profile
                                    settings.
                                </Typography>
                                <Typography>
                                    • Privacy Controls: Adjust what information
                                    is visible in your profile, in the Feed, and
                                    within Spaces.
                                </Typography>
                                <Typography>
                                    • Cookies: Manage or disable cookies in your
                                    browser/app settings.
                                </Typography>
                                <Typography>
                                    • Account Deletion: You may request deletion
                                    of your account and associated data at any
                                    time.
                                </Typography>
                            </Stack>
                        }
                    />

                    <Section
                        title="6. Data Retention"
                        content={
                            <Typography>
                                We retain your information as long as necessary
                                to provide the Service, comply with obligations,
                                and resolve disputes. When data is no longer
                                needed, we securely delete it.
                            </Typography>
                        }
                    />

                    <Section
                        title="7. Security"
                        content={
                            <Typography>
                                We use industry-standard safeguards to protect
                                your data, including encryption, access
                                controls, and regular monitoring. However, no
                                method of storage or transmission is 100%
                                secure.
                            </Typography>
                        }
                    />

                    <Section
                        title="8. Children’s Privacy"
                        content={
                            <Typography>
                                Mutualzz is not intended for users under 13 (or
                                the minimum legal age in your jurisdiction). We
                                do not knowingly collect data from children. If
                                we learn we have done so, we will delete it.
                            </Typography>
                        }
                    />

                    <Section
                        title="9. International Users"
                        content={
                            <Typography>
                                Your information may be transferred and
                                processed outside your country of residence. By
                                using Mutualzz, you consent to such transfers in
                                compliance with applicable laws.
                            </Typography>
                        }
                    />

                    <Section
                        title="10. Changes to This Policy"
                        content={
                            <Typography>
                                We may update this Privacy Policy from time to
                                time. If we make significant changes, we will
                                notify you through the Service or other means.
                            </Typography>
                        }
                    />

                    <Section
                        title="11. Contact Us"
                        my={0}
                        content={
                            <Typography>
                                If you have any questions, concerns, or requests
                                regarding this Privacy Policy, please contact us
                                at:
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
    my = 6,
}: {
    title: string;
    content: React.ReactNode;
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
