import type { APIRole } from "@mutualzz/types";
import {
  Button,
  Divider,
  Stack,
  Switch,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import {
  BitField,
  type PermissionFlag,
  type PermissionFlags,
  permissionFlags
} from "@mutualzz/bitfield";
import { type ReactNode, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { PermissionEditorControls } from "@components/Permissions/PermissionEditorControls";
import {
  filterPermissionGroups,
  permissionCategoryId,
  scrollToPermissionCategory,
  type PermissionGroupDef
} from "@components/Permissions/permissionEditor.utils";

interface Props {
  changes: Partial<Omit<APIRole, "id">>;
  setChanges: (
    next:
      | Partial<Omit<APIRole, "id">>
      | ((prev: Partial<Omit<APIRole, "id">>) => Partial<Omit<APIRole, "id">>)
  ) => void;
}

const PERMISSION_GROUPS: PermissionGroupDef<PermissionFlag>[] = [
  {
    title: "General Space Permissions",
    items: [
      {
        flag: "ViewChannel",
        label: "View Channels",
        description: "Allow members to view channels by default"
      },
      {
        flag: "ManageChannels",
        label: "Manage Channels",
        description: "Allow members to create, edit or delete channels"
      },
      {
        flag: "ManageRoles",
        label: "Manage Roles",
        description:
          "Allows members to create new roles and edit or delete roles lower than their highest role"
      },
      {
        flag: "CreateExpressions",
        label: "Create Expressions",
        description: "Allow members to create emoji and stickers in this space."
      },
      {
        flag: "ManageExpressions",
        label: "Manage Expressions",
        description:
          "Allow members to edit or delete emoji and stickers in this space."
      },
      {
        flag: "ManageSpace",
        label: "Manage Space",
        description: "Allow members to change this space"
      }
    ]
  },
  {
    title: "Membership Permissions",
    items: [
      {
        flag: "CreateInvites",
        label: "Create Invites",
        description: "Allow members to invite new people to this space"
      },
      {
        flag: "KickMembers",
        label: "Kick Members",
        description:
          "Kick will remove other members from this space. Kicked members can rejoin if they have another invite."
      },
      {
        flag: "BanMembers",
        label: "Ban Members",
        description:
          "Ban will remove members from this space and prevent them from rejoining until they are unbanned."
      }
    ]
  },
  {
    title: "Text Channel Permissions",
    items: [
      {
        flag: "SendMessages",
        label: "Send Messages",
        description: "Allow members to send messages in text channels"
      },
      {
        flag: "EmbedLinks",
        label: "Embed Links",
        description: "Allow members to embed links in messages"
      },
      {
        flag: "AttachFiles",
        label: "Attach Files",
        description: "Allow members to attach files in messages"
      },
      {
        flag: "MentionEveryone",
        label: "Mention Everyone",
        description: "Allow members to mention @everyone and @here in messages"
      },
      {
        flag: "UseExternalEmojis",
        label: "Use External Emojis",
        description:
          "Allow members to use emojis from other spaces or their own in their messages"
      },
      {
        flag: "ManageMessages",
        label: "Manage Messages",
        description: "Allow members to delete other members messages"
      },
      {
        flag: "ReadMessageHistory",
        label: "Read Message History",
        description: "Allow members to read message history"
      }
    ]
  },
  {
    title: "Voice Channel Permissions",
    items: [
      {
        flag: "Connect",
        label: "Connect",
        description: "Allow members to connect to voice channels"
      },
      {
        flag: "Speak",
        label: "Speak",
        description: "Allow members to speak in voice channels"
      }
    ]
  },
  {
    title: "Advanced Permissions",
    items: [
      {
        flag: "Administrator",
        label: "Administrator",
        description: (
          <>
            Members with this permission will have every permission.{" "}
            <Typography color="danger" variant="plain" fontWeight="bold">
              This is a dangerous permission to grant
            </Typography>
            .
          </>
        )
      }
    ]
  }
];

const PermissionItem = ({
  flag,
  label,
  description,
  hasPermission,
  togglePermission
}: {
  flag: PermissionFlag;
  label: ReactNode;
  description?: ReactNode;
  hasPermission: boolean;
  togglePermission: (flag: PermissionFlag) => void;
}) => {
  const { theme } = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      mr={5}
      flex={1}
      p={1.25}
      borderRadius={6}
      css={{
        cursor: "pointer",
        ":hover": {
          background: `${theme.colors.info}22`
        }
      }}
      onClick={() => togglePermission(flag)}
    >
      <Stack direction="column" spacing={0.5}>
        <Typography>{label}</Typography>
        {description && (
          <Typography level="body-sm" textColor="muted">
            {description}
          </Typography>
        )}
      </Stack>
      <Switch
        checked={hasPermission}
        color="primary"
        shape="circle"
        onChange={() => togglePermission(flag)}
      />
    </Stack>
  );
};

export const SpaceRoleEditPermissions = observer(
  ({ changes, setChanges }: Props) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const [search, setSearch] = useState("");

    const permissions: BitField<PermissionFlags> = changes.allow
      ? BitField.fromString(permissionFlags, changes.allow.toString())
      : BitField.fromString(permissionFlags, "0");

    const categories = PERMISSION_GROUPS.map((group) => ({
      id: permissionCategoryId(group.title),
      title: group.title
    }));

    const visibleGroups = filterPermissionGroups(PERMISSION_GROUPS, search);

    const togglePermission = (flag: PermissionFlag) => {
      const newPermissions = permissions.has(flag)
        ? permissions.remove(flag)
        : permissions.add(flag);

      setChanges((prev) => ({
        ...prev,
        allow: newPermissions.bits
      }));
    };

    const clearPermissions = () => {
      setChanges((prev) => ({
        ...prev,
        allow: 0n
      }));
    };

    const handleCategoryJump = (categoryId: string) => {
      setSearch("");
      setTimeout(() => {
        scrollToPermissionCategory(rootRef.current, categoryId);
      }, 0);
    };

    return (
      <Stack
        ref={rootRef}
        direction="column"
        justifyContent="center"
        pb={10}
        spacing={3}
      >
        <Stack direction="row" alignItems="flex-start" spacing={2.5} mr={5}>
          <Stack flex={1} minWidth={0}>
            <PermissionEditorControls
              search={search}
              onSearchChange={setSearch}
              categories={categories}
              onCategoryJump={handleCategoryJump}
            />
          </Stack>
          <Button
            color="danger"
            onClick={() => clearPermissions()}
            size="sm"
            variant="soft"
            disabled={permissions.toArray().length === 0}
            css={{ flexShrink: 0, marginTop: 2 }}
          >
            Clear permissions
          </Button>
        </Stack>

        {visibleGroups.length === 0 ? (
          <Typography textColor="muted" textAlign="center" py={4}>
            No permissions match your search
          </Typography>
        ) : (
          visibleGroups.map((group, groupIndex) => {
            const categoryId = permissionCategoryId(group.title);

            return (
              <Stack
                key={categoryId}
                direction="column"
                spacing={2.5}
                data-permission-category={categoryId}
              >
                <Stack alignItems="center">
                  <Typography level="body-lg">{group.title}</Typography>
                </Stack>
                <Stack direction="column" spacing={2.5}>
                  {group.items.map((item, itemIndex) => (
                    <Stack key={item.flag} direction="column" spacing={2.5}>
                      <PermissionItem
                        flag={item.flag}
                        label={item.label}
                        description={item.description}
                        hasPermission={permissions.has(item.flag)}
                        togglePermission={togglePermission}
                      />
                      {itemIndex < group.items.length - 1 && (
                        <Divider css={{ opacity: 0.5 }} />
                      )}
                    </Stack>
                  ))}
                </Stack>
                {groupIndex < visibleGroups.length - 1 && (
                  <Divider css={{ opacity: 0.35 }} />
                )}
              </Stack>
            );
          })
        )}
      </Stack>
    );
  }
);
