import { observer } from "mobx-react-lite";
import { UserProfilePopoutTrigger } from "@components/Profile/popout/UserProfilePopoutTrigger";
import { useState } from "react";
import { useAppStore } from "@hooks/useStores";
import { useMenu } from "@contexts/ContextMenu.context";
import type { Space } from "@stores/objects/Space";
import type { VoiceState } from "@stores/objects/VoiceState.ts";
import { useDraggable } from "@dnd-kit/core";
import { VoiceChannelMemberRow } from "./VoiceChannelMemberRow";

interface Props {
  space: Space;
  state: VoiceState;
}

export const ChannelMemberItem = observer(({ space, state }: Props) => {
  const app = useAppStore();
  const [hovered, setHovered] = useState(false);
  const { openContextMenu } = useMenu();

  const member = space.members.get(state.userId);
  const user = member?.user ?? state.user ?? app.users.get(state.userId);
  if (!member && !user) return null;

  const isStale = !!state.disconnectedAt;
  const isOtherClient =
    state.sessionId !== app.voice.currentSessionId &&
    state.userId === app.account?.id;

  const isSubtle = isStale || isOtherClient;

  const me = space.members.me;
  const canDrag =
    !isSubtle &&
    !!member &&
    !!me &&
    me.hasPermission("MoveMembers") &&
    (space.ownerId === me.userId || me.canManageMember(member, "MoveMembers"));

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `voice-member:${state.userId}`,
    disabled: !canDrag,
    data: {
      type: "voice-member",
      userId: state.userId,
      channelId: state.channelId,
      spaceId: space.id,
      hovered
    }
  });

  const row = (
    <div
      ref={setNodeRef}
      style={{
        width: "100%",
        visibility: isDragging ? "hidden" : "visible",
        opacity: isSubtle ? 0.55 : 1,
        cursor: canDrag ? (isDragging ? "grabbing" : "grab") : "pointer",
        touchAction: canDrag ? "none" : undefined
      }}
      {...(canDrag ? listeners : undefined)}
      {...(canDrag ? attributes : undefined)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onContextMenu={(e) => {
        if (!member || !user) return;
        openContextMenu(e, {
          type: "user",
          space: member.space,
          member,
          user
        });
      }}
    >
      <VoiceChannelMemberRow space={space} state={state} hovered={hovered} />
    </div>
  );

  if (!user) return row;

  return (
    <UserProfilePopoutTrigger
      user={user}
      member={member}
      placement="right"
    >
      {row}
    </UserProfilePopoutTrigger>
  );
});
