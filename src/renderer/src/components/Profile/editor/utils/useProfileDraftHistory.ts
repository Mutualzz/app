import type { ProfileDraftState } from "@components/Profile/editor/utils/profileEditor.utils";
import { useCallback, useReducer } from "react";

const HISTORY_LIMIT = 100;
const COALESCE_WINDOW_MS = 400;

type DraftUpdate =
  | ProfileDraftState
  | null
  | ((current: ProfileDraftState | null) => ProfileDraftState | null);

interface DraftHistoryState {
  past: ProfileDraftState[];
  present: ProfileDraftState | null;
  future: ProfileDraftState[];
  lastChangeAt: number;
}

type DraftHistoryAction =
  | { type: "set"; update: DraftUpdate; now: number }
  | { type: "reset"; draft: ProfileDraftState | null }
  | { type: "undo" }
  | { type: "redo" };

const draftHistoryReducer = (
  state: DraftHistoryState,
  action: DraftHistoryAction
): DraftHistoryState => {
  switch (action.type) {
    case "set": {
      const nextDraft =
        typeof action.update === "function"
          ? action.update(state.present)
          : action.update;
      if (nextDraft === state.present) return state;

      const shouldCoalesce =
        action.now - state.lastChangeAt < COALESCE_WINDOW_MS;
      const past =
        state.present && !shouldCoalesce
          ? [...state.past, state.present].slice(-HISTORY_LIMIT)
          : state.past;

      return { past, present: nextDraft, future: [], lastChangeAt: action.now };
    }
    case "undo": {
      const previousDraft = state.past.at(-1);
      if (!previousDraft) return state;

      return {
        past: state.past.slice(0, -1),
        present: previousDraft,
        future: state.present ? [state.present, ...state.future] : state.future,
        lastChangeAt: 0
      };
    }
    case "redo": {
      const [nextDraft, ...remainingFuture] = state.future;
      if (!nextDraft) return state;

      return {
        past: state.present ? [...state.past, state.present] : state.past,
        present: nextDraft,
        future: remainingFuture,
        lastChangeAt: 0
      };
    }
    case "reset":
      return { past: [], present: action.draft, future: [], lastChangeAt: 0 };
  }
};

export const useProfileDraftHistory = (
  createInitialDraft: () => ProfileDraftState | null
) => {
  const [history, dispatch] = useReducer(
    draftHistoryReducer,
    undefined,
    () => ({
      past: [],
      present: createInitialDraft(),
      future: [],
      lastChangeAt: 0
    })
  );

  const setDraft = useCallback(
    (update: DraftUpdate) => dispatch({ type: "set", update, now: Date.now() }),
    []
  );
  const resetDraft = useCallback(
    (draft: ProfileDraftState | null) => dispatch({ type: "reset", draft }),
    []
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  return {
    draft: history.present,
    setDraft,
    resetDraft,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0
  };
};
