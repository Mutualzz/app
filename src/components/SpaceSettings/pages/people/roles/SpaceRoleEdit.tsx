import { observer } from "mobx-react-lite";
import { Role } from "@stores/objects/Role";
import { useEffect, useState } from "react";
import { Box, ButtonGroup, Divider, Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { useMutation } from "@tanstack/react-query";
import type { Space } from "@stores/objects/Space.ts";
import { styled } from "@mutualzz/ui-core";
import { useMenu } from "@contexts/ContextMenu.context.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { SpaceRoleEditDisplay } from "@components/SpaceSettings/pages/people/roles/SpaceRoleEditDisplay.tsx";
import type { APIRole } from "@mutualzz/types";
import { useDraft } from "@hooks/useDraft.ts";
import { SpaceRoleEditPermissions } from "@components/SpaceSettings/pages/people/roles/SpaceRoleEditPermissions.tsx";
import { normalizeJSON } from "@utils/JSON.ts";
import { RoleActionConfirm } from "@components/Modals/RoleActionConfirm.tsx";
import { useModal } from "@contexts/Modal.context.tsx";

interface Props {
    membersWithRole: number;
    currentRole: Role;
    setCurrentRole: (role: Role | null) => void;
    roles: Role[];
    space: Space;
}

type Tab = "display" | "permissions" | "manage-members";

const RoleColorBlob = styled("span")<{ color: string }>(({ color }) => ({
    width: 12,
    height: 12,
    backgroundColor: color,
    borderRadius: "50%",
}));

type RoleEditable = Pick<
    APIRole,
    "name" | "color" | "position" | "permissions" | "hoist"
>;

export const SpaceRoleEdit = observer(
    ({ space, currentRole, setCurrentRole, membersWithRole, roles }: Props) => {
        const app = useAppStore();
        const { openContextMenu } = useMenu();
        const { openModal } = useModal();

        const [tab, setTab] = useState<Tab>(
            currentRole.id === space.id ? "permissions" : "display",
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
                permissions: json.permissions,
                hoist: json.hoist,
            };
        };

        const { draft, dirty, reset, setDraft, diff, commitBase } =
            useDraft<RoleEditable>(
                () => pickEditable(currentRole),
                [currentRole.id],
            );

        const { mutate: createRole, isPending: creatingRole } = useMutation({
            mutationKey: ["create-role", space.id],
            mutationFn: async () => space.roles.create(),
            onSuccess: (data) => {
                const newRole = space.roles.add(data);
                setCurrentRole(newRole);
            },
        });

        const { mutate: updateRole, isPending: updatingRole } = useMutation({
            mutationKey: ["update-role", currentRole.id],
            mutationFn: async () => {
                const patch = normalizeJSON(diff());
                if (Object.keys(patch).length === 0)
                    return currentRole.toJSON();

                console.log("Updating role with patch:", patch);

                return app.rest.patch<APIRole>(
                    `/spaces/${space.id}/roles/${currentRole.id}`,
                    patch,
                );
            },
            onSuccess: (data) => {
                space.roles.update(data);

                const storeRole =
                    space.roles.get(currentRole.id) ?? currentRole;
                setCurrentRole(storeRole);

                const nextDraft = pickEditable(storeRole);
                setDraft(nextDraft);
                commitBase(nextDraft);
            },
            onError: (error) => {
                console.error(error);
            },
        });

        if (!currentRole) return null;

        return (
            <Stack
                direction="row"
                flex={1}
                minWidth={0}
                height="100%"
                minHeight={0}
            >
                <Paper
                    direction="column"
                    borderLeft="0 !important"
                    borderTop="0 !important"
                    borderBottom="0 !important"
                    spacing={2.5}
                    maxWidth="10em"
                    width="100%"
                    elevation={app.settings?.preferEmbossed ? 3 : 1}
                    py={2.5}
                    px={1.25}
                >
                    <Stack direction="row" justifyContent="space-between">
                        <Button
                            startDecorator={<FaArrowLeft />}
                            variant="plain"
                            onClick={() => setCurrentRole(null)}
                            size="sm"
                        >
                            Back
                        </Button>
                        <IconButton
                            onClick={() => createRole()}
                            disabled={creatingRole}
                            size="sm"
                        >
                            <FaPlus />
                        </IconButton>
                    </Stack>

                    <Stack direction="column">
                        <ButtonGroup
                            color="neutral"
                            spacing={2.5}
                            orientation="vertical"
                            horizontalAlign="left"
                        >
                            {roles.map((role) => (
                                <Button
                                    key={`space-role-${role.id}`}
                                    variant={
                                        role.id === currentRole.id
                                            ? "soft"
                                            : "plain"
                                    }
                                    disabled={role.id === currentRole.id}
                                    onClick={() => setCurrentRole(role)}
                                    startDecorator={
                                        <RoleColorBlob color={role.color} />
                                    }
                                    onContextMenu={(e) =>
                                        openContextMenu(e, {
                                            type: "role",
                                            space,
                                            role,
                                            onDelete: () => {
                                                if (currentRole.id === role.id)
                                                    setCurrentRole(null);
                                            },
                                        })
                                    }
                                >
                                    {role.name}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </Stack>
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
                                Edit Role - {currentRole.name}
                            </Typography>
                            <IconButton
                                onClick={() =>
                                    openModal(
                                        "delete-role",
                                        <RoleActionConfirm
                                            role={currentRole}
                                        />,
                                    )
                                }
                                size="sm"
                                color="danger"
                            >
                                <FaTrash />
                            </IconButton>
                        </Stack>

                        <Box>
                            <ButtonGroup spacing={10} variant="plain">
                                <Button
                                    onClick={() => setTab("display")}
                                    color="info"
                                    selected={tab === "display"}
                                    disabled={
                                        tab === "display" ||
                                        currentRole.id === space.id
                                    }
                                >
                                    Display
                                </Button>
                                <Button
                                    color="info"
                                    selected={tab === "permissions"}
                                    disabled={tab === "permissions"}
                                    onClick={() => setTab("permissions")}
                                >
                                    Permissions
                                </Button>
                                <Button
                                    color="info"
                                    disabled={
                                        tab === "manage-members" ||
                                        currentRole.id === space.id
                                    }
                                    onClick={() => setTab("manage-members")}
                                    selected={tab === "manage-members"}
                                >
                                    Manage Members
                                    {currentRole.id !== space.id
                                        ? ` (${membersWithRole})`
                                        : ""}
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
                                            ? (
                                                  next as (
                                                      p: RoleEditable,
                                                  ) => RoleEditable
                                              )(prev)
                                            : (next as RoleEditable),
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
                                            ? (
                                                  next as (
                                                      p: RoleEditable,
                                                  ) => RoleEditable
                                              )(prev)
                                            : (next as RoleEditable),
                                    )
                                }
                            />
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
                                    You have unsaved changes!
                                </Typography>

                                <ButtonGroup
                                    disabled={updatingRole || !dirty}
                                    spacing={10}
                                >
                                    <Button
                                        color="danger"
                                        variant="plain"
                                        onClick={reset}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="solid"
                                        color="success"
                                        onClick={() => updateRole()}
                                    >
                                        Save Changes
                                    </Button>
                                </ButtonGroup>
                            </Paper>
                        </Box>
                    )}
                </Stack>
            </Stack>
        );
    },
);
