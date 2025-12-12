import { SpaceSettingsModal } from "@components/SpaceSettings/SpaceSettingsModal";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Item, Menu, Submenu } from "@mutualzz/contexify";
import { Divider, Tooltip } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { type Dispatch, type SetStateAction } from "react";
import {
    FaArrowRight,
    FaDoorOpen,
    FaPaperPlane,
    FaTrash,
} from "react-icons/fa";

interface Props {
    space: Space;
    fromSidebar?: boolean;
    setMenuOpen?: Dispatch<SetStateAction<boolean>>;
}

export const SpaceContextMenu = observer(
    ({ space, fromSidebar, setMenuOpen }: Props) => {
        const app = useAppStore();
        const navigate = useNavigate();
        const { openModal } = useModal();

        const { mutate: deleteSpace, isPending } = useMutation({
            mutationKey: ["delete-space", space.id],
            mutationFn: async () => space.delete(),
            onSuccess: ({ id }) => {
                if (app.spaces.activeId === id)
                    navigate({ to: "/", replace: true });
            },
        });

        const { mutate: leaveSpace, isPending: isLeaving } = useMutation({
            mutationKey: ["leave-space", space.id],
            mutationFn: async () => space.leave(),
            onSuccess: (member) => {
                if (app.spaces.activeId === member.space?.id) {
                    navigate({ to: "/", replace: true });
                }
            },
        });

        const canModifySpace =
            app.account && space.owner && app.account.id === space.owner.id;

        const onVisibilityChange = (visible: boolean) => {
            setMenuOpen?.(visible);
        };

        return (
            <Menu
                id={`space-context-menu-${space.id}-${fromSidebar ? "sidebar" : "default"}`}
                onVisibilityChange={onVisibilityChange}
            >
                {fromSidebar && (
                    <>
                        <Tooltip
                            content={
                                <TooltipWrapper>
                                    Not implemented yet
                                </TooltipWrapper>
                            }
                            placement="right"
                        >
                            <Item color="neutral" disabled>
                                Mark as read
                            </Item>
                        </Tooltip>
                        <Divider
                            lineColor="muted"
                            css={{
                                marginBlock: 10,
                            }}
                        />
                    </>
                )}
                {canModifySpace && (
                    <>
                        <Submenu
                            onClick={() =>
                                openModal(
                                    `space-settings-${space.id}`,
                                    <SpaceSettingsModal space={space} />,
                                )
                            }
                            label="Server Settings"
                            arrow={<FaArrowRight />}
                        >
                            <Item
                                onClick={() =>
                                    openModal(
                                        `space-settings-${space.id}`,
                                        <SpaceSettingsModal
                                            space={space}
                                            redirectTo="invites"
                                        />,
                                    )
                                }
                                endDecorator={<FaPaperPlane />}
                            >
                                Invites
                            </Item>
                        </Submenu>
                        <Item
                            color="danger"
                            onClick={() => deleteSpace()}
                            disabled={isPending}
                            id={`space-delete-${space.id}`}
                            endDecorator={<FaTrash />}
                        >
                            Delete Space
                        </Item>
                    </>
                )}
                {!canModifySpace && (
                    <Item
                        color="neutral"
                        endDecorator={<FaDoorOpen />}
                        onClick={() => leaveSpace()}
                        disabled={isLeaving}
                        id={`space-leave-${space.id}`}
                    >
                        Leave Server
                    </Item>
                )}
            </Menu>
        );
    },
);
