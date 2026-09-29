import { createStore, del, get, set } from "idb-keyval";

const attachmentStore = createStore("message-attachments", "attachments");

const getDraftKey = (accountId: string, channelId: string) =>
  `${accountId}:${channelId}`;

export interface StoredMessageAttachment {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  spoiler: boolean;
}

export async function saveMessageAttachments(
  accountId: string,
  channelId: string,
  attachments: StoredMessageAttachment[]
) {
  const key = getDraftKey(accountId, channelId);

  if (attachments.length === 0) {
    await del(key, attachmentStore);
    return;
  }

  await set(key, attachments, attachmentStore);
}

export async function getMessageAttachments(
  accountId: string,
  channelId: string
): Promise<StoredMessageAttachment[]> {
  return (
    (await get<StoredMessageAttachment[]>(
      getDraftKey(accountId, channelId),
      attachmentStore
    )) ?? []
  );
}

export async function deleteMessageAttachments(
  accountId: string,
  channelId: string
) {
  await del(getDraftKey(accountId, channelId), attachmentStore);
}
