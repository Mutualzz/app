import anarchyUrl from "@assets/brand-logo/anarchy.png";
import cathedralUrl from "@assets/brand-logo/cathedral.png";
import emoHairUrl from "@assets/brand-logo/emo_hair.png";
import guitarUrl from "@assets/brand-logo/guitar.png";
import microphoneUrl from "@assets/brand-logo/microphone.png";
import pentagramUrl from "@assets/brand-logo/pentagram_overlay.png";
import sceneHairUrl from "@assets/brand-logo/scene_hair.png";
import { useAppStore } from "@hooks/useStores";
import { useTheme } from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const ICON_HOLD = 1.5;
const ICON_MOVE = 0.55;
const ORBIT_ICONS = [
  cathedralUrl,
  sceneHairUrl,
  guitarUrl,
  microphoneUrl,
  emoHairUrl
] as const;

interface BrandLoaderProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}

export const BrandLoader = observer(
  ({ size = 108, color, style, className }: BrandLoaderProps) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const [t, setT] = useState(0);
    const raf = useRef(0);
    const start = useRef(0);

    const themeToUse = app.themes.currentIcon
      ? Theme.toEmotion(app.themes.get(app.themes.currentIcon))
      : theme;
    const bg = color ?? themeToUse.colors.primary;

    useEffect(() => {
      start.current = performance.now();
      const tick = (now: number) => {
        setT((now - start.current) / 1000);
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf.current);
    }, []);

    const radius = size * 0.5;
    const count = ORBIT_ICONS.length;
    const cycle = ICON_HOLD + ICON_MOVE;
    const steps = Math.floor(t / cycle);
    const local = t % cycle;
    const spin =
      local < ICON_HOLD
        ? 0
        : (() => {
            const p = Math.min(1, Math.max(0, (local - ICON_HOLD) / ICON_MOVE));
            return p * p * (3 - 2 * p);
          })();

    const slotStep = (Math.PI * 2) / count;
    const baseAngle = -Math.PI / 2;
    const orbitR = radius * 0.698;
    const iconSize = radius * 0.26;
    const centerSize = radius * 0.251;

    return (
      <div
        className={className}
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: bg,
          flexShrink: 0,
          ...style
        }}
        aria-hidden
      >
        {ORBIT_ICONS.map((src, i) => {
          const slot = ((i + steps) % count + count) % count;
          const angle = baseAngle + (slot + spin) * slotStep;
          const x = radius + orbitR * Math.cos(angle);
          const y = radius + orbitR * Math.sin(angle);
          return (
            <img
              key={src}
              src={src}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                width: iconSize,
                height: iconSize,
                left: x - iconSize / 2,
                top: y - iconSize / 2,
                pointerEvents: "none",
                userSelect: "none"
              }}
            />
          );
        })}
        <img
          src={anarchyUrl}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            width: centerSize,
            height: centerSize,
            left: radius - centerSize / 2,
            top: radius - centerSize / 2,
            pointerEvents: "none",
            userSelect: "none"
          }}
        />
        <img
          src={pentagramUrl}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: size,
            height: size,
            pointerEvents: "none",
            userSelect: "none"
          }}
        />
      </div>
    );
  }
);
