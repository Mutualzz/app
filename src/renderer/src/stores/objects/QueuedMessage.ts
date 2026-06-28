import type {
  APIExpression,
  APIUser,
  MessageType,
  Snowflake
} from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import { MessageBase } from "./MessageBase";
import { action, makeObservable, observable } from "mobx";
import { Expression } from "./Expression";

export enum QueuedMessageStatus {
  Sending = "sending",
  Failed = "failed"
}

export type PendingAttachmentPreview = {
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
};

export type QueuedMessageData = {
  id: Snowflake;
  channelId: Snowflake;
  spaceId?: Snowflake | null;
  content: string;
  type: MessageType;
  createdAt: string;
  authorId: Snowflake;
  author?: APIUser;
  expressionIds?: Snowflake[];
  expressions?: APIExpression[];
  repliedToId?: Snowflake;
  repliedTo?: MessageBase;
  pendingAttachments?: PendingAttachmentPreview[];
};

export class QueuedMessage extends MessageBase {
  progress = 0;
  status: QueuedMessageStatus;
  error?: string;
  expressions = observable.array<Expression>();
  pendingAttachments: PendingAttachmentPreview[];

  abortCallback?: () => void;

  constructor(app: AppStore, data: QueuedMessageData) {
    super(app, data);
    this.id = data.id;
    this.channelId = data.channelId;
    this.spaceId = data.spaceId ?? null;
    this.status = QueuedMessageStatus.Sending;
    this.repliedToId = data.repliedToId ?? null;
    this._repliedTo = data.repliedTo ?? null;
    this.pendingAttachments = data.pendingAttachments ?? [];
    this.expressions = observable.array<Expression>(
      data.expressions ? app.expressions.addAll(data.expressions) : []
    );

    makeObservable(this, {
      progress: observable,
      status: observable,
      error: observable,
      expressions: observable,
      pendingAttachments: observable.shallow,
      abortCallback: observable.ref,
      updateProgress: action.bound,
      setAbortCallback: action.bound,
      abort: action.bound,
      fail: action.bound,
      cleanup: action.bound
    });
  }

  updateProgress(e: ProgressEvent) {
    this.progress = Math.round((e.loaded / e.total) * 100);
  }

  setAbortCallback(cb: () => void) {
    this.abortCallback = cb;
  }

  abort() {
    if (this.abortCallback) {
      this.abortCallback();
    }
  }

  fail(error: string) {
    this.error = error;
    this.status = QueuedMessageStatus.Failed;
  }

  cleanup() {
    this.pendingAttachments.forEach((a) => {
      if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
    });
  }

  delete() {
    this.app.queue.remove(this.id);
    return null;
  }
}
