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
};

export class QueuedMessage extends MessageBase {
  progress = 0;
  status: QueuedMessageStatus;
  error?: string;
  expressions = observable.array<Expression>();

  abortCallback?: () => void;

  constructor(app: AppStore, data: QueuedMessageData) {
    super(app, data);
    this.id = data.id;
    this.channelId = data.channelId;
    this.spaceId = data.spaceId ?? null;
    this.status = QueuedMessageStatus.Sending;
    this.expressions = observable.array<Expression>(
      data.expressions ? app.expressions.addAll(data.expressions) : []
    );

    makeObservable(this, {
      progress: observable,
      status: observable,
      error: observable,
      expressions: observable,
      abortCallback: observable.ref,
      updateProgress: action.bound,
      setAbortCallback: action.bound,
      abort: action.bound,
      fail: action.bound
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

  delete() {
    this.app.queue.remove(this.id);
    return null;
  }
}
