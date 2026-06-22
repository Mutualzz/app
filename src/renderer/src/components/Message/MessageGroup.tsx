import { MessageType } from "@mutualzz/types";
import type { MessageGroup as MessageGroupType } from "@stores/Message.store";
import { observer } from "mobx-react-lite";
import { Message } from "./Message";
import { SystemMessage } from "@components/Message/SystemMessage";
import { Message as MessageObject } from "@stores/objects/Message";

interface Props {
  group: MessageGroupType;
}

export const MessageGroup = observer(({ group }: Props) => {
  const { messages } = group;

  return (
    <>
      {messages.map((message, index) => {
        if (message.type === MessageType.Default)
          return (
            <div key={message.id} id={`message-${message.id}`}>
              <Message
                message={message}
                header={index === messages.length - 1}
              />
            </div>
          );

        if (
          message.type === MessageType.Reply &&
          message instanceof MessageObject
        )
          return (
            <div key={message.id} id={`message-${message.id}`}>
              <Message
                message={message}
                header
                repliedMessage={message.repliedTo}
              />
            </div>
          );

        return <SystemMessage key={message.id} message={message} />;
      })}
    </>
  );
});
