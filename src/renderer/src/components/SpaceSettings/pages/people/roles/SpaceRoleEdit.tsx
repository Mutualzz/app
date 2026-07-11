import { observer } from "mobx-react-lite";
import { Role } from "@stores/objects/Role";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, ButtonGroup, Divider, Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { useMutation } from "@tanstack/react-query";
import type { Space } from "@stores/objects/Space";
import { useAppStore } from "@hooks/useStores";
import { SpaceRoleEditDisplay } from "@components/SpaceSettings/pages/people/roles/SpaceRoleEditDisplay";
import type { APIRole } from "@mutualzz/types";
import { useDraft } from "@hooks/useDraft";
import { SpaceRoleEditPermissions } from "@components/SpaceSettings/pages/people/roles/SpaceRoleEditPermissions";
import { normalizeJSON } from "@utils/JSON";
import { RoleActionConfirm } from "@components/Modals/RoleActionConfirm";
import { useModal } from "@contexts/Modal.context";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { SpaceRoleEditManageMembers } from "./SpaceRoleEditManageMembers";
import { SpaceRoleEditRoleList } from "./SpaceRoleEditRoleList";

interface Props {
  membersWithRole: number;
  currentRole: Role;
  setCurrentRole: (role: Role | null) => void;
  space: Space;
}

type RoleTab = "display" | "permissions" | "manage-members";

type RoleEditable = Pick<
  APIRole,
  "name" | "color" | "position" | "allow" | "hoist"
>;

export const SpaceRoleEdit = observer(
  ({ space, currentRole, setCurrentRole, membersWithRole }: Props) => {
    const { t } = useTranslation("space");
    const { t: tSettings } = useTranslation("settings");
    const app = useAppStore();
    const { openModal } = useModal();

    const [tab, setTab] = useState<RoleTab>(
      currentRole.id === space.id ? "permissions" : "display"
    );

    useEffect(() => {
      if (currentRole.id === space.id) setTab("permissions");
      else setTab("display");
    }, [currentRole.id, space.id]);

    const pickEditable = (role: Role): RoleEditable => {
      const json = role.toJSON();
      return {
        name: json.name,
        color: json.color ?? "#ffffff",
        position: json.position,
        allow: json.allow ?? 0n,
        hoist: json.hoist
      };
    };

    const { draft, dirty, reset, setDraft, diff, commitBase } =
      useDraft<RoleEditable>(() => pickEditable(currentRole), [currentRole.id]);

    const { mutate: createRole, isPending: creatingRole } = useMutation({
      mutationKey: ["create-role", space.id],
      mutationFn: async () => space.roles.create(),
      onSuccess: (data) => {
        const newRole = space.roles.add(data);
        setCurrentRole(newRole);
      }
    });

    const { mutate: updateRole, isPending: updatingRole } = useMutation({
      mutationKey: ["update-role", currentRole.id],
      mutationFn: async () => {
        const patch = normalizeJSON(diff());
        if (Object.keys(patch).length === 0) return currentRole.toJSON();

        return app.rest.patch<APIRole>(
          `/spaces/${space.id}/roles/${currentRole.id}`,
          patch
        );
      },
      onSuccess: (data) => {
        space.roles.update(data);

        const storeRole = space.roles.get(currentRole.id) ?? currentRole;
        setCurrentRole(storeRole);

        const nextDraft = pickEditable(storeRole);
        setDraft(nextDraft);
        commitBase(nextDraft);
      },
      onError: (error) => {
        console.error(error);
      }
    });

    if (!currentRole) return null;

    return (
      <Stack direction="row" flex={1} minWidth={0} height="100%" minHeight={0}>
        <Paper
          direction="column"
          borderLeft="0 !important"
          borderTop="0 !important"
          borderBottom="0 !important"
          spacing={2.5}
          maxWidth="12em"
          width="100%"
          elevation={app.settings?.preferEmbossed ? 3 : 1}
          py={2.5}
          px={1.25}
        >
          <Stack direction="row" justifyContent="space-between">
            <Button
              startDecorator={<ArrowLeftIcon weight="fill" />}
              variant="plain"
              onClick={() => setCurrentRole(null)}
              size="sm"
            >
              {tSettings("profile.avatar.draw.back")}
            </Button>
            <IconButton
              onClick={() => createRole()}
              disabled={creatingRole}
              size="sm"
            >
              <PlusIcon />
            </IconButton>
          </Stack>

          <SpaceRoleEditRoleList
            space={space}
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
            onRoleDeleted={() => setCurrentRole(null)}
          />
        </Paper>

        <Stack
          direction="column"
          spacing={2.5}
          px={4}
          py={2.5}
          flex={1}
          minWidth={0}
          minHeight={0}
          overflow="auto"
        >
          <Stack direction="column" spacing={2.5} flex={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography fontFamily="monospace">
                {t("roles.editTitle", { name: currentRole.name })}
              </Typography>
              <IconButton
                onClick={() =>
                  openModal(
                    "delete-role",
                    <RoleActionConfirm role={currentRole} />
                  )
                }
                size="sm"
                color="danger"
              >
                <TrashIcon weight="fill" />
              </IconButton>
            </Stack>

            <Box>
              <ButtonGroup spacing={10} variant="plain">
                <Button
                  onClick={() => setTab("display")}
                  color="info"
                  selected={tab === "display"}
                  disabled={tab === "display" || currentRole.id === space.id}
                >
                  {t("roles.tabs.display")}
                </Button>
                <Button
                  color="info"
                  selected={tab === "permissions"}
                  disabled={tab === "permissions"}
                  onClick={() => setTab("permissions")}
                >
                  {t("roles.tabs.permissions")}
                </Button>
                <Button
                  color="info"
                  disabled={
                    tab === "manage-members" || currentRole.id === space.id
                  }
                  onClick={() => setTab("manage-members")}
                  selected={tab === "manage-members"}
                >
                  {t("roles.tabs.manageMembers")}
                  {currentRole.id === space.id ? "" : ` (${membersWithRole})`}
                </Button>
              </ButtonGroup>
            </Box>

            <Divider css={{ opacity: 0.5 }} />

            {tab === "display" && (
              <SpaceRoleEditDisplay
                changes={draft}
                setChanges={(next) =>
                  setDraft((prev: RoleEditable) =>
                    typeof next === "function"
                      ? (next as (p: RoleEditable) => RoleEditable)(prev)
                      : (next as RoleEditable)
                  )
                }
              />
            )}

            {tab === "permissions" && (
              <SpaceRoleEditPermissions
                changes={draft}
                setChanges={(next) =>
                  setDraft((prev: RoleEditable) =>
                    typeof next === "function"
                      ? (next as (p: RoleEditable) => RoleEditable)(prev)
                      : (next as RoleEditable)
                  )
                }
              />
            )}

            {tab === "manage-members" && (
              <SpaceRoleEditManageMembers role={currentRole} />
            )}
          </Stack>

          {dirty && (
            <Box
              mt="auto"
              position="sticky"
              bottom={0}
              zIndex={10}
              display="flex"
              justifyContent="center"
            >
              <Paper
                direction="row"
                variant="elevation"
                py={2}
                px={4}
                elevation={app.settings?.preferEmbossed ? 5 : 3}
                justifyContent="space-between"
                alignItems="center"
                borderRadius={12}
                width="100%"
                maxWidth="min(960px, calc(100% - 32px))"
              >
                <Typography level="body-sm">
                  {t("roles.unsavedChanges")}
                </Typography>

                <ButtonGroup disabled={updatingRole || !dirty} spacing={10}>
                  <Button color="danger" variant="plain" onClick={reset}>
                    {tSettings("profile.avatar.upload.reset")}
                  </Button>
                  <Button
                    variant="solid"
                    color="success"
                    onClick={() => updateRole()}
                  >
                    {tSettings("profile.saveChanges")}
                  </Button>
                </ButtonGroup>
              </Paper>
            </Box>
          )}
        </Stack>
      </Stack>
    );
  }
);
