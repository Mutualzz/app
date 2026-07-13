import { Paper } from "@components/Paper";
import { IconButton } from "@components/IconButton";
import { Tooltip } from "@components/Tooltip";
import { useAppStore } from "@hooks/useStores";
import { ButtonGroup, Stack, Typography } from "@mutualzz/ui-web";
import { CubeIcon, UsersIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  name: string;
  onlineCount: number;
  hubConnected: boolean;
  role?: "owner" | "member";
}

export const BridgeChatHeader = observer(
  ({ name, onlineCount, hubConnected, role }: Props) => {
    const app = useAppStore();
    const { t } = useTranslation("settings");

    const subtitle = !hubConnected
      ? t("minecraftBridge.hubDisconnected")
      : onlineCount === 0
        ? t("minecraftBridge.onlineNone")
        : t("minecraftBridge.onlineCount", { count: onlineCount });

    const roleLabel =
      role === "member"
        ? t("minecraftBridge.roleMember")
        : role === "owner"
          ? t("minecraftBridge.roleOwner")
          : null;

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 0}
        p={2.5}
        height="100%"
        borderLeft="0 !important"
        borderRight="0 !important"
        borderTop="0 !important"
        maxHeight="2.95rem"
        direction="row"
        boxShadow="0 !important"
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack
          direction="row"
          alignItems="center"
          flex={1}
          spacing={2}
          minWidth={0}
        >
          <CubeIcon size={24} weight="fill" />
          <Stack
            direction="row"
            alignItems="baseline"
            spacing={1}
            minWidth={0}
            flex={1}
          >
            <Typography
              level="label-sm"
              weight="bold"
              css={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </Typography>
            {roleLabel && (
              <Typography
                level="body-xs"
                textColor="muted"
                css={{ flexShrink: 0 }}
              >
                · {roleLabel}
              </Typography>
            )}
            <Typography
              level="body-xs"
              textColor="muted"
              css={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 1,
              }}
            >
              {subtitle}
            </Typography>
          </Stack>
        </Stack>
        <ButtonGroup variant="plain" spacing={10}>
          <Tooltip
            content={t("minecraftBridge.toggleMembers")}
            placement="bottom"
          >
            <IconButton
              color={app.memberListVisible ? "success" : "neutral"}
              onClick={() => app.toggleMemberList()}
            >
              <UsersIcon size={20} weight="fill" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </Paper>
    );
  },
);
