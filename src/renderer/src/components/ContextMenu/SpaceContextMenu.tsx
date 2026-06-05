import { ContextMenu } from "@components/ContextMenu";
import { ContextSubmenu } from "@components/ContextSubmenu";
import { SpaceSettingsModal } from "@components/SpaceSettings/SpaceSettingsModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Box, Divider, Stack } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { type Dispatch, type SetStateAction } from "react";
import {
  type Page,
  settingsPages
} from "@components/SpaceSettings/SpaceSettingsSidebar";
import startCase from "lodash-es/startCase";
import { generateMenuIDs } from "@contexts/ContextMenu.context";
import { SpaceActionConfirm } from "@components/Modals/SpaceActionConfirm";
import { ContextItem } from "@components/ContextItem";
import type { SpaceSettingsCategories } from "@components/SpaceSettings/SpaceSettings.context";
import { ArrowRightIcon, DoorOpenIcon } from "@phosphor-icons/react";

interface Props {
  space: Space;
  fromSidebar?: boolean;
  setMenuOpen?: Dispatch<SetStateAction<boolean>>;
}

export const SpaceContextMenu = observer(
  ({ space, fromSidebar, setMenuOpen }: Props) => {
    const app = useAppStore();
    const { openModal } = useModal();

    const spaceSettings = Object.entries(settingsPages);

    const onVisibilityChange = (visible: boolean) => {
      setMenuOpen?.(visible);
    };

    const isOwner = space.ownerId === app.account?.id;

    const shouldShowCategory = (category: SpaceSettingsCategories) => {
      return settingsPages[category].some((page) =>
        space.members.me?.hasAnyPermission(page.permissions)
      );
    };

    const shouldShowPage = (page: Page) => {
      return space.members.me?.hasAnyPermission(page.permissions);
    };

    const hasUnread = space.hasUnread();

    return (
      <ContextMenu
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        transparency={0}
        id={generateMenuIDs.space(space.id, fromSidebar)}
        onVisibilityChange={onVisibilityChange}
        key={space.id}
      >
        {fromSidebar && (
          <>
            <ContextItem
              onClick={() => space.markAsRead()}
              disabled={!hasUnread}
            >
              Mark as read
            </ContextItem>
            <Divider css={{ opacity: 0.5 }} />
          </>
        )}
        {spaceSettings && (
          <Stack direction="column" spacing={1.25}>
            {spaceSettings.map(([category, pages]) => (
              <Box key={`context-menu-settings-category-${category}`}>
                {shouldShowCategory(category as SpaceSettingsCategories) && (
                  <ContextSubmenu
                    label={startCase(category)}
                    arrow={<ArrowRightIcon weight="fill" />}
                    elevation={app.settings?.preferEmbossed ? 5 : 1}
                    transparency={0}
                    onClick={() =>
                      openModal(
                        `space-settings-${pages[0].label}-${space.id}`,
                        <SpaceSettingsModal
                          space={space}
                          redirectTo={pages[0].label}
                        />
                      )
                    }
                  >
                    {pages.map(
                      (page) =>
                        shouldShowPage(page) && (
                          <ContextItem
                            id={`space-settings-${page.label}-${space.id}`}
                            key={`context-menu-settings-page-${page.label}`}
                            onClick={() =>
                              openModal(
                                `space-settings-${space.id}`,
                                <SpaceSettingsModal
                                  space={space}
                                  redirectTo={page.label}
                                />
                              )
                            }
                            endDecorator={page.icon}
                          >
                            {startCase(page.label)}
                          </ContextItem>
                        )
                    )}
                  </ContextSubmenu>
                )}
              </Box>
            ))}
          </Stack>
        )}
        {!isOwner && (
          <ContextItem
            color="danger"
            endDecorator={<DoorOpenIcon />}
            onClick={() =>
              openModal(
                "leave-space-confirm",
                <SpaceActionConfirm space={space} action="leave" />
              )
            }
            id={`space-leave-${space.id}`}
            textColor={undefined}
          >
            Leave Space
          </ContextItem>
        )}
      </ContextMenu>
    );
  }
);
