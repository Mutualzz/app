import { observer } from "mobx-react-lite";
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
    <Stack direction="column" flex={1} minHeight={0}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        px={2.5}
        pt={1.5}
        pb={1}
      >
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
      <Stack
        direction="column"
        flex={1}
        minHeight={0}
        spacing={0.5}
        px={1.5}
        pb={2}
        css={{ overflowY: "auto", overflowX: "hidden" }}
      >
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
      </Stack>
    </Stack>
  );
});
