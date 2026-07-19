import type { AppStore } from "@stores/App.store";
import {
  createDefaultSoundToggles,
  SOUND_TO_TOGGLE,
  TOGGLE_PREVIEW_SOUND,
  type AppSound,
  type SoundToggleId
} from "@renderer/utils/soundToggles";
import { makeAutoObservable, observable, reaction } from "mobx";
import { makePersistable } from "mobx-persist-store";

import callConnectOgg from "@assets/sounds/call_connect.ogg";
import callDeclineOgg from "@assets/sounds/call_decline.ogg";
import callDisconnectOgg from "@assets/sounds/call_disconnect.ogg";
import callIncomingOgg from "@assets/sounds/call_incoming.ogg";
import callOutgoingOgg from "@assets/sounds/call_outgoing.ogg";
import deafenOffOgg from "@assets/sounds/deafen_off.ogg";
import deafenOnOgg from "@assets/sounds/deafen_on.ogg";
import messageOgg from "@assets/sounds/message.ogg";
import muteOffOgg from "@assets/sounds/mute_off.ogg";
import muteOnOgg from "@assets/sounds/mute_on.ogg";
import pttStartOgg from "@assets/sounds/ptt_start.ogg";
import pttStopOgg from "@assets/sounds/ptt_stop.ogg";
import streamStartOgg from "@assets/sounds/stream_start.ogg";
import streamStopOgg from "@assets/sounds/stream_stop.ogg";
import userJoinOgg from "@assets/sounds/user_join.ogg";
import userLeaveOgg from "@assets/sounds/user_leave.ogg";

import callConnectWav from "@assets/sounds/call_connect.wav";
import callDeclineWav from "@assets/sounds/call_decline.wav";
import callDisconnectWav from "@assets/sounds/call_disconnect.wav";
import callIncomingWav from "@assets/sounds/call_incoming.wav";
import callOutgoingWav from "@assets/sounds/call_outgoing.wav";
import deafenOffWav from "@assets/sounds/deafen_off.wav";
import deafenOnWav from "@assets/sounds/deafen_on.wav";
import messageWav from "@assets/sounds/message.wav";
import muteOffWav from "@assets/sounds/mute_off.wav";
import muteOnWav from "@assets/sounds/mute_on.wav";
import pttStartWav from "@assets/sounds/ptt_start.wav";
import pttStopWav from "@assets/sounds/ptt_stop.wav";
import streamStartWav from "@assets/sounds/stream_start.wav";
import streamStopWav from "@assets/sounds/stream_stop.wav";
import userJoinWav from "@assets/sounds/user_join.wav";
import userLeaveWav from "@assets/sounds/user_leave.wav";

export type { AppSound, SoundToggleId } from "@renderer/utils/soundToggles";
export { SOUND_TOGGLE_IDS } from "@renderer/utils/soundToggles";

const OGG_SOURCES: Record<AppSound, string> = {
  message: messageOgg,
  user_join: userJoinOgg,
  user_leave: userLeaveOgg,
  call_connect: callConnectOgg,
  call_disconnect: callDisconnectOgg,
  call_incoming: callIncomingOgg,
  call_outgoing: callOutgoingOgg,
  call_decline: callDeclineOgg,
  mute_on: muteOnOgg,
  mute_off: muteOffOgg,
  deafen_on: deafenOnOgg,
  deafen_off: deafenOffOgg,
  ptt_start: pttStartOgg,
  ptt_stop: pttStopOgg,
  stream_start: streamStartOgg,
  stream_stop: streamStopOgg
};

const WAV_SOURCES: Record<AppSound, string> = {
  message: messageWav,
  user_join: userJoinWav,
  user_leave: userLeaveWav,
  call_connect: callConnectWav,
  call_disconnect: callDisconnectWav,
  call_incoming: callIncomingWav,
  call_outgoing: callOutgoingWav,
  call_decline: callDeclineWav,
  mute_on: muteOnWav,
  mute_off: muteOffWav,
  deafen_on: deafenOnWav,
  deafen_off: deafenOffWav,
  ptt_start: pttStartWav,
  ptt_stop: pttStopWav,
  stream_start: streamStartWav,
  stream_stop: streamStopWav
};

function resolveSources(): Record<AppSound, string> {
  if (typeof Audio === "undefined") return WAV_SOURCES;
  const probe = document.createElement("audio");
  const oggOk = probe.canPlayType('audio/ogg; codecs="vorbis"') !== "";
  return oggOk ? OGG_SOURCES : WAV_SOURCES;
}

const SOURCES = resolveSources();
const DEFAULT_VOLUME = 0.45;

export class SoundStore {
  enabled = true;
  toggles = observable.object(createDefaultSoundToggles());

  readonly loopElements = new Map<
    "call_incoming" | "call_outgoing",
    HTMLAudioElement
  >();
  private looping: "call_incoming" | "call_outgoing" | null = null;
  private loopGeneration = 0;
  readonly activeOneShots = new Set<HTMLAudioElement>();
  unlockContext: AudioContext | null = null;
  private unlocked = false;
  private gestureBound = false;
  readonly disposers: Array<() => void> = [];

  constructor(private readonly app: AppStore) {
    makeAutoObservable(
      this,
      {
        loopElements: false,
        activeOneShots: false,
        disposers: false,
        unlockContext: false
      },
      { autoBind: true }
    );

    for (const id of ["call_incoming", "call_outgoing"] as const) {
      const audio = new Audio(SOURCES[id]);
      audio.preload = "auto";
      audio.volume = DEFAULT_VOLUME;
      audio.loop = true;
      this.loopElements.set(id, audio);
    }

    void makePersistable(this, {
      name: "SoundStore",
      properties: ["enabled", "toggles"],
      storage: localStorage
    });

    queueMicrotask(() => {
      this.bindGestureUnlock();
      this.wireReactions();
    });
  }

  private wireReactions() {
    this.disposers.push(
      reaction(
        () => ({
          incoming: this.app.calls.getIncomingRingingChannelId(),
          outgoing: this.app.calls.getOutgoingRingingChannelId()
        }),
        ({ incoming, outgoing }) => {
          if (incoming) {
            this.playLoop("call_incoming");
            return;
          }
          if (outgoing) {
            this.playLoop("call_outgoing");
            return;
          }
          this.stopLoop();
        },
        { fireImmediately: true }
      )
    );

    this.disposers.push(
      reaction(
        () => this.app.voice.connectionStatus,
        (status, previous) => {
          if (status === "connected" && previous !== "connected") {
            const stillRinging =
              !!this.app.calls.getIncomingRingingChannelId() ||
              !!this.app.calls.getOutgoingRingingChannelId();
            if (!stillRinging) {
              this.play("call_connect");
            }
          }
        }
      )
    );

    this.disposers.push(
      reaction(
        () => this.enabled,
        (enabled) => {
          if (!enabled) this.stopAll();
        }
      )
    );
  }

  private bindGestureUnlock() {
    if (this.gestureBound || typeof window === "undefined") return;
    this.gestureBound = true;

    const onGesture = () => {
      this.unlock();
    };

    window.addEventListener("pointerdown", onGesture, {
      capture: true,
      passive: true
    });
    window.addEventListener("keydown", onGesture, {
      capture: true,
      passive: true
    });
    window.addEventListener("touchstart", onGesture, {
      capture: true,
      passive: true
    });

    this.disposers.push(() => {
      window.removeEventListener("pointerdown", onGesture, true);
      window.removeEventListener("keydown", onGesture, true);
      window.removeEventListener("touchstart", onGesture, true);
      this.gestureBound = false;
    });
  }

  isToggleEnabled(id: SoundToggleId) {
    return this.toggles[id] !== false;
  }

  private canPlay(id: AppSound) {
    if (!this.enabled) return false;
    if (!this.isToggleEnabled(SOUND_TO_TOGGLE[id])) return false;
    if (id === "message" && this.isSelfDnd()) return false;
    return true;
  }

  private isSelfDnd() {
    const selfId = this.app.account?.id;
    if (!selfId) return false;
    const status = this.app.presence.get(String(selfId))?.status ?? "online";
    return status === "dnd";
  }

  setEnabled(value: boolean) {
    this.enabled = value;
    if (!value) this.stopAll();
  }

  setToggle(id: SoundToggleId, value: boolean) {
    this.toggles[id] = value;
    if (
      !value &&
      ((id === "call_incoming" && this.looping === "call_incoming") ||
        (id === "call_outgoing" && this.looping === "call_outgoing"))
    ) {
      this.stopLoop();
    }
  }

  unlock() {
    try {
      if (!this.unlockContext) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (Ctor) this.unlockContext = new Ctor();
      }
      const ctx = this.unlockContext;
      if (ctx && ctx.state === "suspended") {
        void ctx.resume().then(
          () => {
            this.unlocked = true;
            this.retryRingIfNeeded();
          },
          () => {
            this.retryRingIfNeeded();
          }
        );
        return;
      }
      this.unlocked = true;
      this.retryRingIfNeeded();
    } catch {
      this.retryRingIfNeeded();
    }
  }

  private retryRingIfNeeded() {
    const incoming = this.app.calls.getIncomingRingingChannelId();
    const outgoing = this.app.calls.getOutgoingRingingChannelId();
    if (incoming) {
      this.playLoop("call_incoming");
      return;
    }
    if (outgoing) {
      this.playLoop("call_outgoing");
    }
  }

  play(id: AppSound) {
    if (!this.canPlay(id)) return;
    if (id === "call_incoming" || id === "call_outgoing") {
      this.playLoop(id);
      return;
    }
    this.playOnce(id);
  }

  preview(toggleId: SoundToggleId) {
    this.unlock();
    const id = TOGGLE_PREVIEW_SOUND[toggleId];
    this.playOnce(id);
  }

  private playOnce(id: AppSound) {
    const src = SOURCES[id];
    if (!src) return;

    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = DEFAULT_VOLUME;
    audio.loop = false;
    this.activeOneShots.add(audio);

    const release = () => {
      this.activeOneShots.delete(audio);
      try {
        audio.pause();
      } catch {}
    };

    audio.addEventListener("ended", release, { once: true });

    const playResult = audio.play();
    if (!playResult || typeof playResult.then !== "function") return;

    void playResult.then(
      () => {
        this.unlocked = true;
      },
      (err: unknown) => {
        this.activeOneShots.delete(audio);
        const name =
          err && typeof err === "object" && "name" in err
            ? String((err as { name?: unknown }).name)
            : "";
        if (name !== "AbortError") {
          try {
            audio.pause();
          } catch {}
        }
        if (name === "NotAllowedError" && !this.unlocked) {
          this.unlock();
        }
      }
    );
  }

  playLoop(id: "call_incoming" | "call_outgoing") {
    if (!this.canPlay(id)) {
      this.stopLoop();
      return;
    }

    const audio = this.loopElements.get(id);
    if (!audio) return;

    if (this.looping === id && !audio.paused && audio.loop) return;

    this.stopLoop();

    const generation = ++this.loopGeneration;
    this.looping = id;
    audio.loop = true;
    try {
      audio.currentTime = 0;
    } catch {}

    const playResult = audio.play();
    if (!playResult || typeof playResult.then !== "function") return;

    void playResult.then(
      () => {
        this.unlocked = true;
        if (this.loopGeneration !== generation || this.looping !== id) {
          try {
            audio.pause();
          } catch {}
          audio.loop = false;
        }
      },
      (err: unknown) => {
        if (this.loopGeneration === generation && this.looping === id) {
          this.looping = null;
        }
        const name =
          err && typeof err === "object" && "name" in err
            ? String((err as { name?: unknown }).name)
            : "";
        if (name === "NotAllowedError" && !this.unlocked) {
          this.unlock();
        }
      }
    );
  }

  stopLoop() {
    this.loopGeneration += 1;
    this.looping = null;
    for (const audio of this.loopElements.values()) {
      audio.loop = false;
      try {
        audio.pause();
      } catch {}
    }
  }

  private stopOneShots() {
    for (const audio of Array.from(this.activeOneShots)) {
      this.activeOneShots.delete(audio);
      try {
        audio.pause();
      } catch {}
    }
  }

  stopAll() {
    this.stopLoop();
    this.stopOneShots();
  }

  dispose() {
    this.stopAll();
    for (const dispose of this.disposers) dispose();
    this.disposers.length = 0;
    for (const audio of this.loopElements.values()) {
      try {
        audio.pause();
      } catch {}
    }
    this.loopElements.clear();
    if (this.unlockContext) {
      void this.unlockContext.close().catch(() => undefined);
      this.unlockContext = null;
    }
  }
}
