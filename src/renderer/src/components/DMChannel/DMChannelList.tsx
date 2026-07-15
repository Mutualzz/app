import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { DMChannelItem } from "@components/DMChannel/DMChannelItem";
import { Stack, Typography } from "@mutualzz/ui-web";
import { IconButton } from "@components/IconButton";
import { useModal } from "@contexts/Modal.context";
import { DMChannelCreate } from "@components/DMChannel/DMChannelCreate";
import { PlusIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";
import { useTranslation } from "react-i18next";

export const DMChannelList = observer(() => {
  const { t } = useTranslation("chat");
  const app = useAppStore();
  const dms = app.channels.dms;

  const { openModal } = useModal();

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 4 : 0}
      direction="column"
      width="100%"
      spacing={1.25}
      borderBottom="0 !important"
      borderRight="0 !important"
      borderLeft="0 !important"
      position="relative"
      p={2.5}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography level="label-xs">{t("dm.title")}</Typography>
        <Tooltip content={t("dm.newMessage")} placement="top">
          <IconButton
            onClick={() => openModal("create-group-dm", <DMChannelCreate />)}
            size={12}
          >
            <PlusIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      {dms.length === 0 && (
        <Typography
          level="body-sm"
          textColor="secondary"
          textAlign="center"
          mt={2}
        >
          {t("dm.empty")}
        </Typography>
      )}
      {dms.map((dm) => (
        <DMChannelItem key={dm.id} channel={dm} />
      ))}
    </Paper>
  );
});
