import { Button } from "@components/Button";
import { InputWithLabel } from "@components/InputWithLabel";
import { DeleteApplicationConfirm } from "@components/Modals/DeleteApplicationConfirm";
import { Paper } from "@components/Paper";
import { ListSkeleton } from "@components/Skeletons";
import { SettingsSection } from "@components/UserSettings/SettingsField";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { formatRestError } from "@mutualzz/client";
import { type APIApplication, CDNRoutes } from "@mutualzz/types";
import { Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { MAX_APPLICATIONS_PER_USER } from "@mutualzz/validators";
import { GameControllerIcon } from "@phosphor-icons/react";
import { REST } from "@stores/REST.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { type ChangeEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const APPLICATIONS_QUERY_KEY = ["applications", "@me"] as const;

const ApplicationIcon = ({ application }: { application: APIApplication }) => {
  if (!application.icon)
    return (
      <Stack
        width={64}
        height={64}
        borderRadius={12}
        alignItems="center"
        justifyContent="center"
        css={{ opacity: 0.5 }}
      >
        <GameControllerIcon size={32} weight="fill" />
      </Stack>
    );

  return (
    <img
      alt={application.name}
      src={REST.makeCDNUrl(
        CDNRoutes.applicationIcon(application.id, application.icon)
      )}
      css={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover" }}
    />
  );
};

const ApplicationCard = observer(
  ({ application }: { application: APIApplication }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const { openModal } = useModal();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(application.name);
    const [description, setDescription] = useState(
      application.description ?? ""
    );

    const replaceInCache = (updated: APIApplication) =>
      queryClient.setQueryData<APIApplication[]>(
        APPLICATIONS_QUERY_KEY,
        (prev) => prev?.map((a) => (a.id === updated.id ? updated : a))
      );

    const { mutate: save, isPending: saving } = useMutation({
      mutationFn: () =>
        app.rest.patch<APIApplication>(`/applications/${application.id}`, {
          name,
          description: description.trim() || null
        }),
      onSuccess: (updated) => {
        replaceInCache(updated);
        toast.success(t("applications.saved"));
      },
      onError: (error) =>
        toast.error(formatRestError(error, t("applications.error")))
    });

    const { mutate: uploadIcon, isPending: uploading } = useMutation({
      mutationFn: (file: File) => {
        const formData = new FormData();
        formData.append("icon", file);
        return app.rest.putFormData<APIApplication>(
          `/applications/${application.id}/icon`,
          formData
        );
      },
      onSuccess: replaceInCache,
      onError: (error) =>
        toast.error(formatRestError(error, t("applications.error")))
    });

    const { mutate: removeIcon, isPending: removingIcon } = useMutation({
      mutationFn: () =>
        app.rest.delete<APIApplication>(`/applications/${application.id}/icon`),
      onSuccess: replaceInCache,
      onError: (error) =>
        toast.error(formatRestError(error, t("applications.error")))
    });

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) uploadIcon(file);
    };

    const handleDelete = () =>
      openModal(
        "delete-application",
        <DeleteApplicationConfirm
          name={application.name}
          onConfirm={async () => {
            try {
              await app.rest.delete(`/applications/${application.id}`);
            } catch (error) {
              toast.error(formatRestError(error, t("applications.error")));
              throw error;
            }
            queryClient.setQueryData<APIApplication[]>(
              APPLICATIONS_QUERY_KEY,
              (prev) => prev?.filter((a) => a.id !== application.id)
            );
            toast.success(t("applications.deleted"));
          }}
        />
      );

    const copyId = async () => {
      await navigator.clipboard.writeText(application.id);
      toast.success(t("applications.copied"));
    };

    const dirty =
      name !== application.name ||
      description.trim() !== (application.description ?? "");
    const busy = saving || uploading || removingIcon;

    return (
      <Paper
        variant="outlined"
        borderRadius={10}
        p={2.5}
        spacing={2}
        direction="column"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <ApplicationIcon application={application} />
          <Stack direction="column" spacing={0.75} flex={1} minWidth={0}>
            <Typography level="body-md" fontWeight="bold">
              {application.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                level="body-sm"
                textColor="muted"
                fontFamily="monospace"
              >
                {application.id}
              </Typography>
              <Button size="sm" variant="plain" onClick={copyId}>
                {t("applications.copyId")}
              </Button>
            </Stack>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFile}
            css={{ display: "none" }}
          />
          <Button
            size="sm"
            variant="outlined"
            disabled={busy}
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {t("applications.uploadIcon")}
          </Button>
          {application.icon && (
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              disabled={busy}
              onClick={() => removeIcon()}
            >
              {t("applications.removeIcon")}
            </Button>
          )}
        </Stack>
        <Typography level="body-xs" textColor="muted">
          {t("applications.iconHint")}
        </Typography>

        <InputWithLabel
          name={`application-name-${application.id}`}
          label={t("applications.name")}
          value={name}
          maxLength={32}
          onChange={(e) => setName(e.target.value)}
        />

        <Stack direction="column" spacing={0.5}>
          <Typography fontWeight={500}>
            {t("applications.description")}
          </Typography>
          <Textarea
            value={description}
            maxLength={400}
            rows={2}
            placeholder={t("applications.descriptionPlaceholder")}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Button
            size="sm"
            variant="outlined"
            color="danger"
            disabled={busy}
            onClick={handleDelete}
          >
            {t("applications.delete")}
          </Button>
          <Button
            size="sm"
            color="success"
            disabled={!dirty || busy || name.trim().length < 2}
            loading={saving}
            onClick={() => save()}
          >
            {t("applications.save")}
          </Button>
        </Stack>
      </Paper>
    );
  }
);

export const UserApplicationsSettings = observer(() => {
  const { t } = useTranslation("settings");
  const { t: tChat } = useTranslation("chat");
  const app = useAppStore();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: APPLICATIONS_QUERY_KEY,
    queryFn: () => app.rest.get<APIApplication[]>("/applications/@me")
  });

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: () =>
      app.rest.post<APIApplication>("/applications", { name: newName }),
    onSuccess: (created) => {
      queryClient.setQueryData<APIApplication[]>(
        APPLICATIONS_QUERY_KEY,
        (prev) => [created, ...(prev ?? [])]
      );
      setNewName("");
      toast.success(t("applications.created"));
    },
    onError: (error) =>
      toast.error(formatRestError(error, t("applications.error")))
  });

  const atLimit = applications.length >= MAX_APPLICATIONS_PER_USER;

  return (
    <Stack pt={2.5} pb={5} mx={20} direction="column" spacing={2.5}>
      <SettingsSection description={t("applications.intro")}>
        <Stack direction="row" spacing={1.25} alignItems="flex-end">
          <InputWithLabel
            name="application-new-name"
            label={t("applications.create")}
            description={t("applications.createDescription")}
            value={newName}
            maxLength={32}
            disabled={atLimit}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim().length >= 2) create();
            }}
          />
          <Button
            color="success"
            disabled={atLimit || creating || newName.trim().length < 2}
            loading={creating}
            onClick={() => create()}
          >
            {t("applications.create")}
          </Button>
        </Stack>
        <Typography level="body-xs" textColor="muted">
          {t("applications.limit", {
            count: applications.length,
            max: MAX_APPLICATIONS_PER_USER
          })}
        </Typography>
        <Typography level="body-xs" textColor="muted">
          {t("applications.applicationIdDescription")}
        </Typography>
      </SettingsSection>

      {isLoading && (
        <ListSkeleton label={tChat("loading")} count={2} leading="icon" />
      )}

      {!isLoading && applications.length === 0 && (
        <Typography textAlign="center" textColor="muted" py="2rem">
          {t("applications.empty")}
        </Typography>
      )}

      {applications.map((application) => (
        <ApplicationCard key={application.id} application={application} />
      ))}
    </Stack>
  );
});
