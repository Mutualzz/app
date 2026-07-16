import { Paper } from "@components/Paper";
import { InputWithLabel } from "@components/InputWithLabel";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../Button";

const sanitizeServerId = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9_-]/g, "");

export interface CreatedBridgeResult {
  id: string;
  name: string;
  pluginConfig: {
    hubUrl: string;
    token: string;
    serverId: string;
  };
}

interface Props {
  spaceId: string;
  onCreated?: (bridge: CreatedBridgeResult) => void;
}

export const CreateBridgeModal = observer(({ spaceId, onCreated }: Props) => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const { closeModal } = useModal();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [serverId, setServerId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canCreate = serverId.trim().length > 0;

  const { mutate: createBridge, isPending } = useMutation({
    mutationKey: ["create-bridge"],
    mutationFn: () =>
      app.rest.post<CreatedBridgeResult>(`/spaces/${spaceId}/bridge`, {
        name: name.trim() || t("minecraftBridge.namePlaceholder"),
        serverId: sanitizeServerId(serverId),
      }),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ["space", spaceId, "bridge"] });
      onCreated?.(created);
      closeModal();
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      justifyContent="space-between"
      spacing={1.25}
      width="35vw"
    >
      <Stack direction="column" spacing={5}>
        <Typography level="h5" fontWeight="bold">
          {t("minecraftBridge.createTitle")}
        </Typography>
        <Typography level="body-sm" textColor="secondary">
          {t("minecraftBridge.getStartedHint")}
        </Typography>

        {error && (
          <Typography level="body-sm" color="danger">
            {error}
          </Typography>
        )}

        <InputWithLabel
          name="bridgeName"
          label={t("minecraftBridge.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("minecraftBridge.namePlaceholder")}
          type="text"
        />

        <InputWithLabel
          name="serverId"
          label={t("minecraftBridge.serverId")}
          value={serverId}
          onChange={(e) => setServerId(sanitizeServerId(e.target.value))}
          placeholder={t("minecraftBridge.serverIdPlaceholder")}
          type="text"
          description={t("minecraftBridge.serverIdHint")}
          required
        />
      </Stack>

      <Stack direction="row" spacing={1.25}>
        <Button
          color="neutral"
          variant="soft"
          expand
          disabled={isPending}
          onClick={() => closeModal()}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          expand
          disabled={isPending || !canCreate}
          onClick={() => createBridge()}
        >
          {isPending
            ? t("minecraftBridge.creating")
            : t("minecraftBridge.create")}
        </Button>
      </Stack>
    </Paper>
  );
});
