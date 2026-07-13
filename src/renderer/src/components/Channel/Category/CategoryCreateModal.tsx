import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { ChannelType, HttpException } from "@mutualzz/types";
import { Button, Input, Stack, Typography } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FolderSimpleIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

interface Props {
  space: Space;
}

export const CategoryCreateModal = observer(({ space }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();
  const { t } = useTranslation("space");
  const { t: tCommon } = useTranslation("common");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});

  const { mutate: createCategory, isPending: isCreating } = useMutation({
    mutationKey: ["create-category", space.id, name],
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", ChannelType.Category.toString());
      formData.append("spaceId", space.id);

      return app.rest.postFormData("channels", formData);
    },
    onSuccess: () => {
      closeModal();
    },
    onError: (err: HttpException) => {
      err.errors?.forEach((error) => {
        setErrors((prev) => ({
          ...prev,
          [error.path]: error.message
        }));
      });
    }
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      borderRadius={8}
      width="20vw"
      direction="column"
      minHeight={250}
      transparency={65}
      justifyContent="space-between"
      onKeyDown={(e) => e.key === "Enter" && createCategory()}
      px={5}
    >
      <Stack direction="column" my="auto" spacing={1.25}>
        <Stack direction="column" spacing={1.25}>
          <Typography>{t("channels.createCategory.name")}</Typography>
          <Input
            startDecorator={<FolderSimpleIcon weight="fill" />}
            fullWidth
            color="neutral"
            name="channel-name"
            type="text"
            autoComplete="off"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("channels.createCategory.namePlaceholder")}
          />
          {errors.name && <Typography color="danger">{errors.name}</Typography>}
        </Stack>
      </Stack>
      <Stack mb={2.5} spacing={1.25}>
        <Button
          color="danger"
          onClick={() => closeModal()}
          disabled={isCreating}
          expand
        >
          {tCommon("cancel")}
        </Button>
        <Button
          disabled={isCreating || name.length === 0}
          onClick={() => createCategory()}
          expand
        >
          {t("channels.createCategory.submit")}
        </Button>
      </Stack>
    </Paper>
  );
});
