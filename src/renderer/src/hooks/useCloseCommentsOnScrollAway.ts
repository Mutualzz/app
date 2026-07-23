import { useEffect, type RefObject } from "react";

export function useCloseCommentsOnScrollAway(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
  enabled = true,
  scrollRootId = "post-list-scroll"
) {
  useEffect(() => {
    if (!enabled || !open) return;

    const el = ref.current;
    if (!el) return;

    const listScroll = document.getElementById(scrollRootId);
    const root =
      listScroll && listScroll.contains(el) ? listScroll : null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) onClose();
      },
      { threshold: 0.15, root }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, open, onClose, ref, scrollRootId]);
}
