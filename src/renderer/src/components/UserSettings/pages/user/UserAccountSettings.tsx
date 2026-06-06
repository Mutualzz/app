import { Box, Button, Paper, Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { UserAvatar } from "@components/User/UserAvatar";
import { useUserSettings } from "@components/UserSettings/UserSettings.context";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "@contexts/Modal.context";
import { EmailVerifyCode } from "@components/Modals/EmailVerifyCode";
import { ChangePassword } from "@components/Modals/ChangePassword";
import { Link } from "@components/Link";
import { EmailChange } from "@components/Modals/EmailChange";
import { UsernameChange } from "@components/Modals/UsernameChange";

export const UserAccountSettings = observer(() => {
  const app = useAppStore();
  const { setCurrentPage } = useUserSettings();
  const { openModal } = useModal();
  const account = app.account;

  const [hideEmail, setHideEmail] = useState(true);

  const { mutate: sendEmailVerification, isPending: sendingCode } = useMutation(
    {
      mutationKey: [`emailVerification`, account?.id],
      mutationFn: () => app.rest.post("/@me/send-email-code"),
      onSuccess: () => {
        openModal("email-verification", <EmailVerifyCode />);
      }
    }
  );

  const { mutate: sendConfirmEmail, isPending: confirmingEmail } = useMutation({
    mutationKey: [`confirmEmail`, account?.id],
    mutationFn: () => {
      if (!account?.flags.has("Verified")) return Promise.resolve();
      return app.rest.post("/@me/confirm-email");
    },
    onSuccess: () => {
      openModal("email-change", <EmailChange />);
    }
  });

  const switchToProfile = () => {
    setCurrentPage("profile");
  };

  const toggleEmail = () => setHideEmail(!hideEmail);

  if (!account) return null;

  const maskedEmail = (() => {
    const email = account.email ?? "";
    const atIndex = email.indexOf("@");

    if (atIndex === -1) return "****";

    const domain = email.slice(atIndex + 1);
    const localPartLength = atIndex;

    if (!domain) return "****";

    return `${"*".repeat(localPartLength)}@${domain}`;
  })();

  return (
    <Stack mx={20} direction="column" flex={1}>
      <Paper my={10} direction="column" borderRadius={8}>
        <Paper
          position="relative"
          variant="solid"
          color={account.accentColor}
          py={12.5}
          width="100%"
          borderRadius={8}
        >
          <Box position="absolute" top={20} left={2.5}>
            <UserAvatar user={account} size={72} badge />
          </Box>
        </Paper>
        <Stack direction="column" spacing={1.25} my={2.5}>
          <Stack justifyContent="space-between" width="100%" pr={2.5}>
            <Typography level="title-md" ml={22.5}>
              {account.displayName}
            </Typography>
            <Button color="primary" onClick={switchToProfile}>
              Edit User Profile
            </Button>
          </Stack>
          <Paper
            borderRadius={8}
            spacing={5}
            elevation={-2}
            p={2}
            m={7.5}
            direction="column"
          >
            <Stack
              width="100%"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="column">
                <Typography fontWeight="bold">Display Name</Typography>
                <Typography level="body-sm">
                  {account.globalName ?? "Not set"}
                </Typography>
              </Stack>
              <Box>
                <Button color="neutral" onClick={switchToProfile}>
                  Edit
                </Button>
              </Box>
            </Stack>
            <Stack
              width="100%"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="column">
                <Typography fontWeight="bold">Username</Typography>
                <Typography level="body-sm">{account.username}</Typography>
              </Stack>
              <Box>
                <Button
                  color="neutral"
                  onClick={() =>
                    openModal("change-username", <UsernameChange />)
                  }
                >
                  Edit
                </Button>
              </Box>
            </Stack>
            <Stack
              width="100%"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="column" justifyContent="center" spacing={1.25}>
                <Stack spacing={1.25}>
                  <Typography fontWeight="bold">Email</Typography>
                  {!account.flags.has("Verified") && (
                    <Typography level="body-sm" variant="plain" color="danger">
                      (Unverified)
                    </Typography>
                  )}
                </Stack>
                <Stack spacing={1.25}>
                  <Typography level="body-sm">
                    {hideEmail && account.flags.has("Verified")
                      ? maskedEmail
                      : account.email}
                  </Typography>
                  {account.flags.has("Verified") && (
                    <Link
                      level="body-xs"
                      onClick={toggleEmail}
                      color="info"
                      variant="plain"
                    >
                      {hideEmail ? "Show" : "Hide"}
                    </Link>
                  )}
                  {!account.flags.has("Verified") && (
                    <Link
                      level="body-xs"
                      onClick={() => sendEmailVerification()}
                      disabled={sendingCode}
                      variant="solid"
                      color="success"
                      css={{
                        padding: "2px 8px",
                        borderRadius: 16
                      }}
                      underline="none"
                    >
                      Verify
                    </Link>
                  )}
                </Stack>
              </Stack>
              <Box>
                <Button
                  color="neutral"
                  onClick={() => {
                    sendConfirmEmail();
                  }}
                  disabled={confirmingEmail}
                >
                  Edit
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>
      <Stack direction="column" spacing={1.25}>
        <Typography fontWeight="bold">Password</Typography>
        <Box>
          <Button
            color="primary"
            onClick={() => openModal("change-password", <ChangePassword />)}
          >
            Change Password
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
});
