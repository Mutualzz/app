import { UserProfilePopout } from "@components/Profile/popout/UserProfilePopout";
import type { AccountStore } from "@stores/Account.store";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import type { User } from "@stores/objects/User";
import { Popover, type PopoverPlacement } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  user: User | AccountStore;
  member?: SpaceMember;
  disabled?: boolean;
  placement?: PopoverPlacement;
}

export const UserProfilePopoutTrigger = observer(
  ({ user, member, disabled, placement = "left", children }: Props) => {
    if (disabled) return <>{children}</>;

    return (
      <Popover
        trigger={children}
        placement={placement}
        closeOnClickOutside
        variant="plain"
        elevation={0}
        transparency={100}
        css={{
          padding: 0,
          background: "transparent",
          boxShadow: "none",
          overflow: "visible"
        }}
      >
        <UserProfilePopout user={user} member={member} />
      </Popover>
    );
  }
);
