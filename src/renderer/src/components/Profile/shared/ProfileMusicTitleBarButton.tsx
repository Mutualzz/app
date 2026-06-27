import { ProfileMusicPlayer } from "@components/Profile/shared/ProfileMusicPlayer";
import { IconButton } from "@components/IconButton";
import type { APIProfileMusic } from "@mutualzz/types";
import type { UserProfile } from "@stores/objects/UserProfile";
import { Box } from "@mutualzz/ui-web";
import { MusicNotesIcon } from "@phosphor-icons/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PLAYER_WIDTH = 340;

interface Props {
  music: APIProfileMusic;
  profile: UserProfile;
  autoPlay?: boolean;
}

export function ProfileMusicTitleBarButton({
  music,
  profile,
  autoPlay
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      left: Math.max(8, rect.right - PLAYER_WIDTH)
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !playerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <>
      <Box ref={triggerRef}>
        <IconButton
          size="sm"
          variant={open ? "soft" : "plain"}
          color="warning"
          onClick={() => setOpen((o) => !o)}
        >
          <MusicNotesIcon weight={open ? "fill" : "regular"} />
        </IconButton>
      </Box>

      {createPortal(
        <Box
          ref={playerRef}
          css={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: PLAYER_WIDTH,
            zIndex: 9999,
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transform: open
              ? "scale(1) translateY(0)"
              : "scale(0.95) translateY(-6px)",
            transformOrigin: "top right",
            transition:
              "opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          <ProfileMusicPlayer
            music={music}
            profile={profile}
            autoPlay={autoPlay}
          />
        </Box>,
        document.body
      )}
    </>
  );
}
