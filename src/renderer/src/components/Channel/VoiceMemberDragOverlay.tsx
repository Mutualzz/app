import { useDndContext } from "@dnd-kit/core";
import { useAppStore } from "@hooks/useStores";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { VoiceChannelMemberRow } from "./VoiceChannelMemberRow";

interface Props {
  space: Space;
}

export const VoiceMemberDragOverlay = observer(({ space }: Props) => {
  const app = useAppStore();
  const { active } = useDndContext();

  if (!active || active.data.current?.type !== "voice-member") return null;

  const userId = active.data.current.userId as string;
  const channelId = active.data.current.channelId as string | undefined;
  const state =
    app.voiceStates.get(userId) ??
    (channelId
      ? app.voiceStates.getByChannel(userId, channelId)
      : undefined);
  if (!state) return null;

  const width =
    active.rect.current.initial?.width ??
    active.rect.current.translated?.width;

  const hovered = Boolean(active.data.current.hovered);

  return (
    <div
      style={{
        width: width && width > 0 ? width : undefined,
        minWidth: width && width > 0 ? width : 200,
        cursor: "grabbing",
        pointerEvents: "none",
        opacity: 1
      }}
    >
      <VoiceChannelMemberRow space={space} state={state} hovered={hovered} />
    </div>
  );
});
