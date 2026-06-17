import { observer } from "mobx-react-lite";

const HANDLES = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w"
] as const;

interface Props {
  onPointerDown: (
    event: React.PointerEvent,
    handle: (typeof HANDLES)[number]
  ) => void;
}

export const ProfileBlockHandles = observer(({ onPointerDown }: Props) => (
  <>
    {HANDLES.map((handle) => {
      const position = getHandleStyle(handle);
      return (
        <div
          key={handle}
          onPointerDown={(event) => {
            event.stopPropagation();
            onPointerDown(event, handle);
          }}
          css={{
            position: "absolute",
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#fff",
            border: "2px solid #6366f1",
            ...position,
            zIndex: 2
          }}
        />
      );
    })}
  </>
));

const getHandleStyle = (handle: (typeof HANDLES)[number]) => {
  switch (handle) {
    case "nw":
      return { top: -5, left: -5, cursor: "nwse-resize" };
    case "n":
      return { top: -5, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" };
    case "ne":
      return { top: -5, right: -5, cursor: "nesw-resize" };
    case "e":
      return { top: "50%", right: -5, transform: "translateY(-50%)", cursor: "ew-resize" };
    case "se":
      return { bottom: -5, right: -5, cursor: "nwse-resize" };
    case "s":
      return { bottom: -5, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" };
    case "sw":
      return { bottom: -5, left: -5, cursor: "nesw-resize" };
    case "w":
      return { top: "50%", left: -5, transform: "translateY(-50%)", cursor: "ew-resize" };
  }
};
