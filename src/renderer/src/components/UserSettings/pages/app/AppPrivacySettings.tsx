import { Button } from "@components/Button";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { privacyLabelKey } from "@mutualzz/client";
import {
  DM_PRIVACY_OPTIONS,
  PROFILE_VISIBILITY_OPTIONS,
  type DmPrivacy,
  type ProfileVisibility
} from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  SettingsSection,
  SettingsSelectField
} from "@components/UserSettings/SettingsField";

export const AppPrivacySettings = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const settings = app.settings;
  const blocked = app.relationships.blocked;

  useEffect(() => {
    void app.relationships.resolveAll(true);
  }, [app.relationships]);

  useEffect(() => {
    for (const relationship of blocked) {
      const userId = relationship.otherUserIdForMe;
      if (userId) void app.users.resolve(userId);
    }
  }, [app.users, blocked]);

  if (!settings) return null;

  const extended = settings.extendedSettings;

  const patchExtended = (next: Partial<typeof extended>) => {
    settings.patchExtendedSettings(next);
  };

  const privacyLabel = (value: DmPrivacy | ProfileVisibility) =>
    t(privacyLabelKey(value));

  return (
    <Stack spacing={7.5} pt={2.5} pb={5} direction="column">
      <SettingsSection title={t("privacy.title")}>
        <SettingsSelectField
          title={t("privacy.whoCanDm")}
          description={t("privacy.whoCanDmDescription")}
          value={extended.whoCanDm}
          onChange={(value) => patchExtended({ whoCanDm: value as DmPrivacy })}
          options={DM_PRIVACY_OPTIONS.map((value) => ({
            value,
            label: privacyLabel(value)
          }))}
        />

        <SettingsSelectField
          title={t("privacy.profileVisibility")}
          description={t("privacy.profileVisibilityDescription")}
          value={extended.profileVisibility}
          onChange={(value) =>
            patchExtended({ profileVisibility: value as ProfileVisibility })
          }
          options={PROFILE_VISIBILITY_OPTIONS.map((value) => ({
            value,
            label: privacyLabel(value)
          }))}
        />

      </SettingsSection>

      <SettingsSection title={t("privacy.blockedUsers")}>
        {blocked.length === 0 ? (
          <Typography level="body-sm" textColor="muted">
            {t("privacy.blockedUsersEmpty")}
          </Typography>
        ) : (
          blocked.map((relationship) => {
            const userId = relationship.otherUserIdForMe;
            const user = userId ? app.users.get(userId) : null;
            if (!userId) return null;

            return (
              <Stack
                key={relationship.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  {user ? <UserAvatar user={user} size="sm" /> : null}
                  <Typography level="body-sm">
                    {user?.displayName ?? userId}
                  </Typography>
                </Stack>
                <Button
                  variant="outlined"
                  size="sm"
                  color="neutral"
                  onClick={() => void app.relationships.unblockUser(userId)}
                >
                  {t("chat:contextMenu.unblock", { ns: "chat" })}
                </Button>
              </Stack>
            );
          })
        )}
      </SettingsSection>
    </Stack>
  );
});
