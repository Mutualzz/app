import { maskEmail } from "@mutualzz/client";
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
import { DeleteAccount } from "@components/Modals/DeleteAccount";
import { SettingsActionRow } from "@components/UserSettings/SettingsField";
import { useNavigate } from "@tanstack/react-router";
import { ColorLike } from "@mutualzz/ui-core";
import { useTranslation } from "react-i18next";

export const UserAccountSettings = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const { setCurrentPage } = useUserSettings();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();
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

  const openAvatarStudio = () => {
    closeModal();
    navigate({ to: "/avatar", search: { method: "upload" } });
  };

  const toggleEmail = () => setHideEmail(!hideEmail);

  if (!account) return null;

  const maskedEmail = maskEmail(account.email ?? "");

  return (
    <Stack mx={20} direction="column" flex={1}>
      <Paper my={10} direction="column" borderRadius={8}>
        <Paper
          position="relative"
          variant="solid"
          color={account.accentColor as ColorLike}
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
            <Button color="primary" onClick={openAvatarStudio}>
              {t("account.editAvatar")}
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
            <SettingsActionRow
              title={t("account.displayName")}
              description={account.globalName ?? t("account.notSet")}
              actionLabel={t("account.edit")}
              onClick={switchToProfile}
            />
            <SettingsActionRow
              title={t("account.username")}
              description={account.username}
              actionLabel={t("account.edit")}
              onClick={() =>
                openModal("change-username", <UsernameChange />)
              }
            />
            <SettingsActionRow
              title={t("account.email")}
              description={
                <Stack direction="column" spacing={1.25}>
                  {!account.flags.has("Verified") && (
                    <Typography level="body-sm" variant="plain" color="danger">
                      {t("account.unverified")}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1.25} alignItems="center">
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
                        {hideEmail ? t("account.show") : t("account.hide")}
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
                        {t("account.verify")}
                      </Link>
                    )}
                  </Stack>
                </Stack>
              }
              actionLabel={t("account.edit")}
              actionDisabled={confirmingEmail}
              onClick={() => sendConfirmEmail()}
            />
          </Paper>
        </Stack>
      </Paper>
      <SettingsActionRow
        title={t("account.password")}
        actionLabel={t("account.changePassword")}
        onClick={() => openModal("change-password", <ChangePassword />)}
      />
      <Stack direction="column" spacing={1.25} mt={5}>
        <Typography fontWeight="bold" color="danger">
          {t("account.dangerZone")}
        </Typography>
        <Typography level="body-sm">
          {t("account.dangerZoneDescription")}
        </Typography>
        <Box>
          <Button
            color="danger"
            onClick={() => openModal("delete-account", <DeleteAccount />)}
          >
            {t("account.deleteAccount")}
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
});
