import { RefObject, useCallback, useEffect, useRef, useState } from "react";

type TopTab = "emoji" | "gifs" | "stickers";

export function useEmojiPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TopTab>("emoji");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
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
    computePosition(triggerRef as any);
    setIsOpen(true);
  }, [computePosition]);

  const close = useCallback(() => setIsOpen(false), []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const openToTab = useCallback(
    (tab: TopTab) => {
      setActiveTab(tab);
      computePosition(triggerRef as any);
      setIsOpen(true);
    },
    [computePosition]
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) return;

      // Don't close if clicking inside a context menu
      const contextMenuEl = document.querySelector("[role='menu']");
      if (contextMenuEl?.contains(e.target as Node)) return;

      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, close]);

  // Close on Escape
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
