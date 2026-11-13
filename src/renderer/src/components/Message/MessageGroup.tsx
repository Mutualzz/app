import { MessageType } from "@mutualzz/types";
import type { MessageGroup as MessageGroupType } from "@stores/Message.store";
import { Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { Message } from "./Message";
import { SystemMessage } from "@components/Message/SystemMessage";
import { useAppStore } from "@hooks/useStores";
import { shouldShowMessageAvatar } from "@utils/messageLayout";

interface Props {
  group: MessageGroupType;
}

export const MessageGroup = observer(({ group }: Props) => {
  const app = useAppStore();
  const { messages } = group;
  const orderedMessages = [...messages].reverse();
  const messageDisplay = app.settings?.messageDisplay ?? "default";
  const compact = messageDisplay === "compact";

  return (
    <Stack direction="column">
      {orderedMessages.map((message, index) => {
        const isGroupStart = index === 0;

        if (message.type === MessageType.Default) {
          const header = isGroupStart;
          const showAvatar = shouldShowMessageAvatar(messageDisplay, header);

          return (
            <div
              key={message.id}
              id={`message-${message.id}`}
              data-message-id={message.id}
              tabIndex={-1}
              role="article"
            >
              <Message
                message={message}
                header={header}
                showAvatar={showAvatar}
                compact={compact}
              />
            </div>
          );
        }

        if (message.type === MessageType.Reply)
          return (
            <div
              key={message.id}
              id={`message-${message.id}`}
              data-message-id={message.id}
              tabIndex={-1}
              role="article"
            >
              <Message
                message={message}
                header
                showAvatar={shouldShowMessageAvatar(messageDisplay, true)}
                compact={compact}
                repliedMessage={message.repliedTo}
              />
            </div>
          );

        return <SystemMessage key={message.id} message={message} />;
      })}
    </Stack>
  );
});
