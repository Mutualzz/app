import { RefObject, useCallback, useEffect, useRef, useState } from "react";

type TopTab = "emoji" | "gifs" | "stickers";

export function useExpressionPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TopTab>("emoji");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const computePosition = useCallback((ref: RefObject<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pickerHeight = 500;
    const pickerWidth = 500;

    let top = rect.top - pickerHeight - 8;
    let left = rect.left - 350;

    if (top < 8) top = rect.bottom + 8;
    if (left + pickerWidth > window.innerWidth - 8)
      left = window.innerWidth - pickerWidth - 8;

    setPosition({ top, left });
  }, []);

  const open = useCallback(() => {
    activeTriggerRef.current = triggerRef.current;
    computePosition(triggerRef as RefObject<HTMLButtonElement>);
    setIsOpen(true);
  }, [computePosition]);

  const close = useCallback(() => setIsOpen(false), []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const openToTab = useCallback(
    (tab: TopTab, anchorRef?: RefObject<HTMLButtonElement>) => {
      const ref = anchorRef ?? (triggerRef as RefObject<HTMLButtonElement>);
      activeTriggerRef.current = ref.current;
      setActiveTab(tab);
      computePosition(ref);
      setIsOpen(true);
    },
    [computePosition]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) return;

      const contextMenuEl = document.querySelector("[role='menu']");
      if (contextMenuEl?.contains(e.target as Node)) return;

      const target = e.target as Node;
      const clickedActiveTrigger =
        activeTriggerRef.current?.contains(target) ?? false;
      const clickedEmojiTrigger = triggerRef.current?.contains(target) ?? false;

      if (
        pickerRef.current &&
        !pickerRef.current.contains(target) &&
        !clickedActiveTrigger &&
        !clickedEmojiTrigger
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  return {
    isOpen,
    toggle,
    close,
    openToTab,
    activeTab,
    setActiveTab,
    position,
    triggerRef,
    pickerRef
  };
}
