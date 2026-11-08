import type { APIScheduledMessage } from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";

export interface ScheduleMessageInput {
  content: string;
  stickerIds: string[];
  files: File[];
  spoilers: boolean[];
  repliedToId?: string;
  mentionReply: boolean;
  scheduledFor: Date;
}

export const createScheduledMessage = async (
  app: AppStore,
  channelId: string,
  input: ScheduleMessageInput
) => {
  const path = `/channels/${channelId}/scheduled-messages`;
  const scheduledFor = input.scheduledFor.toISOString();

  let result: APIScheduledMessage;

  if (input.files.length > 0) {
    const formData = new FormData();
    if (input.content) formData.append("content", input.content);
    formData.append("scheduledFor", scheduledFor);
    input.stickerIds.forEach((stickerId) =>
      formData.append("expressionIds[]", stickerId)
    );
    if (input.repliedToId) {
      formData.append("repliedToId", input.repliedToId);
      formData.append("mentionReply", String(input.mentionReply));
    }
    input.files.forEach((file, index) => {
      formData.append("attachments", file);
      formData.append(
        "attachmentSpoilers[]",
        String(input.spoilers[index] ?? false)
      );
    });
    result = await app.rest.postFormData<APIScheduledMessage>(path, formData);
  } else {
    result = await app.rest.post<APIScheduledMessage>(path, {
      content: input.content,
      scheduledFor,
      ...(input.stickerIds.length > 0
        ? { expressionIds: input.stickerIds }
        : {}),
      ...(input.repliedToId
        ? { repliedToId: input.repliedToId, mentionReply: input.mentionReply }
        : {})
    });
  }

  app.scheduledMessages.upsert(result);
  return result;
};
