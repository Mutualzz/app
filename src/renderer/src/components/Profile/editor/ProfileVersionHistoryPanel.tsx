import { BrandLoader } from "@components/BrandLoader";
import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { Tooltip } from "@components/Tooltip";
import { getApiErrorMessage } from "@components/Profile/editor/utils/profileEditor.utils";
import { useAppStore } from "@hooks/useStores";
import type { APIUserProfileVersion } from "@mutualzz/types";
import { formatColor } from "@mutualzz/ui-core";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  ClockCounterClockwiseIcon,
  TrashIcon,
  XIcon
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const PROFILE_VERSIONS_QUERY_KEY = "profile-versions";

interface Props {
  onRestore: (version: APIUserProfileVersion) => void;
}

export const ProfileVersionHistoryPanel = observer(({ onRestore }: Props) => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const queryClient = useQueryClient();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { theme } = useTheme();
  const accountId = app.account?.id;

  const {
    data: versions,
    isLoading,
    isError
  } = useQuery({
    queryKey: [PROFILE_VERSIONS_QUERY_KEY, accountId],
    enabled: !!accountId,
    queryFn: () => app.profiles.getVersions()
  });

  const { mutate: deleteVersion, isPending: deleting } = useMutation({
    mutationFn: (versionId: string) => app.profiles.deleteVersion(versionId),
    onSuccess: (_result, versionId) => {
      queryClient.setQueryData<APIUserProfileVersion[]>(
        [PROFILE_VERSIONS_QUERY_KEY, accountId],
        (current) =>
          current?.filter((version) => version.id !== versionId) ?? current
      );
      setPendingDeleteId(null);
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, t("profile.history.deleteFailed")))
  });

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" py={3}>
        <BrandLoader size={32} />
      </Stack>
    );
  }

  if (isError) {
    return (
      <Typography level="body-sm" textColor="muted">
        {t("profile.history.failed")}
      </Typography>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Typography level="body-sm" textColor="muted" css={{ lineHeight: 1.4 }}>
        {t("profile.history.empty")}
      </Typography>
    );
  }

  return (
    <Stack direction="column" spacing={0.75}>
      {versions.map((version) => {
        const savedAt = dayjs(version.savedAt);

        return (
          <Stack
            key={version.id}
            direction="row"
            alignItems="center"
            spacing={1}
            px={1}
            py={0.75}
            css={{
              borderRadius: 8,
              background: formatColor(theme.colors.neutral, {
                alpha: 8,
                format: "hexa"
              })
            }}
          >
            <ClockCounterClockwiseIcon size={16} css={{ opacity: 0.6 }} />
            <Stack direction="column" flex={1} minWidth={0}>
              <Typography level="body-sm" fontWeight={600}>
                {savedAt.fromNow()}
              </Typography>
              <Typography level="body-xs" textColor="muted">
                {savedAt.toDate().toLocaleString()} ·{" "}
                {t("profile.history.blockCount", {
                  count: version.profile.blocks.length
                })}
              </Typography>
            </Stack>
            {pendingDeleteId === version.id ? (
              <>
                <Button
                  size="sm"
                  color="danger"
                  disabled={deleting}
                  onClick={() => deleteVersion(version.id)}
                >
                  {t("profile.history.confirmDelete")}
                </Button>
                <Tooltip content={tCommon("cancel")}>
                  <IconButton
                    size="sm"
                    variant="plain"
                    aria-label={tCommon("cancel")}
                    onClick={() => setPendingDeleteId(null)}
                  >
                    <XIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  color="neutral"
                  onClick={() => onRestore(version)}
                >
                  {t("profile.history.restore")}
                </Button>
                <Tooltip content={t("profile.history.delete")}>
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="danger"
                    aria-label={t("profile.history.delete")}
                    onClick={() => setPendingDeleteId(version.id)}
                  >
                    <TrashIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
});
