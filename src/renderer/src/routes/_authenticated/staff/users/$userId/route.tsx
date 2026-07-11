import { Paper } from "@components/Paper";
import { StaffPanelHeader } from "@components/Staff/StaffPanelHeader";
import { StaffUserActionsSection } from "@components/Staff/sections/StaffUserActionsSection";
import { StaffUserAuditSection } from "@components/Staff/sections/StaffUserAuditSection";
import { StaffUserFlagsSection } from "@components/Staff/sections/StaffUserFlagsSection";
import { StaffUserInfoSection } from "@components/Staff/sections/StaffUserInfoSection";
import { StaffUserNotesSection } from "@components/Staff/sections/StaffUserNotesSection";
import { StaffUserSessionsSection } from "@components/Staff/sections/StaffUserSessionsSection";
import { StaffUserSidebar } from "@components/Staff/StaffUserSidebar";
import {
  staffSectionTitleKeys,
  type StaffSection
} from "@components/Staff/staffSections";
import { useAppStore } from "@hooks/useStores";
import type { APIPrivateUser } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { UserIcon } from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/staff/users/$userId")({
  component: StaffUserRoute
});

function StaffUserRoute() {
  const { userId } = Route.useParams();
  const app = useAppStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation("staff");
  const { t: tChat } = useTranslation("chat");
  const { t: tSettings } = useTranslation("settings");
  const embossed = app.settings?.preferEmbossed;
  const [section, setSection] = useState<StaffSection>("info");

  const userQueryKey = ["staff-user", userId];

  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: userQueryKey,
    queryFn: () => app.rest.get<APIPrivateUser>(`/staff/users/${userId}`)
  });

  const handleUpdated = (updated: APIPrivateUser) => {
    queryClient.setQueryData(userQueryKey, updated);
    queryClient.invalidateQueries({ queryKey: ["staff-actions", userId] });
  };

  const handleForcedLogout = () => {
    queryClient.invalidateQueries({ queryKey: ["staff-actions", userId] });
    queryClient.invalidateQueries({ queryKey: ["staff-sessions", userId] });
  };

  const handleWarned = () => {
    queryClient.invalidateQueries({ queryKey: ["staff-actions", userId] });
  };

  const handleHardDeleted = () => {
    queryClient.removeQueries({ queryKey: userQueryKey });
    queryClient.invalidateQueries({ queryKey: ["staff-all-actions"] });
    navigate({ to: "/staff" });
  };

  if (isLoading) {
    return (
      <Stack
        flex={1}
        height="100%"
        width="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Typography textColor="secondary">{tChat("loading")}</Typography>
      </Stack>
    );
  }

  if (!user || error) {
    return (
      <Stack
        flex={1}
        height="100%"
        width="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Typography textColor="secondary">
          {tSettings("profile.viewer.userNotFound")}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      flex={1}
      height="100%"
      width="100%"
      overflow="hidden"
    >
      <StaffUserSidebar
        user={user}
        section={section}
        onSectionChange={setSection}
      />

      <Stack
        flex={1}
        height="100%"
        overflow="auto"
        width="100%"
        direction="column"
      >
        <StaffPanelHeader
          title={user.globalName || user.username}
          icon={<UserIcon size={22} weight="fill" />}
        />

        <Paper
          flex={1}
          height="100%"
          overflow="auto"
          width="100%"
          spacing={1.5}
          elevation={embossed ? 2 : 0}
          direction="column"
          px={{ xs: "0.5rem", sm: 3 }}
          py={{ xs: "0.5rem", sm: 3 }}
          borderTop="0 !important"
          borderLeft="0 !important"
          borderBottom="0 !important"
        >
          <Typography level="body-sm" textColor="muted" fontWeight={600}>
            {t(staffSectionTitleKeys[section])}
          </Typography>
          {section === "info" && (
            <StaffUserInfoSection user={user} onUpdated={handleUpdated} />
          )}
          {section === "flags" && (
            <StaffUserFlagsSection user={user} onUpdated={handleUpdated} />
          )}
          {section === "actions" && (
            <StaffUserActionsSection
              user={user}
              onUpdated={handleUpdated}
              onForcedLogout={handleForcedLogout}
              onWarned={handleWarned}
              onHardDeleted={handleHardDeleted}
            />
          )}
          {section === "sessions" && (
            <StaffUserSessionsSection userId={user.id} />
          )}
          {section === "notes" && <StaffUserNotesSection userId={user.id} />}
          {section === "audit" && <StaffUserAuditSection userId={user.id} />}
        </Paper>
      </Stack>
    </Stack>
  );
}
