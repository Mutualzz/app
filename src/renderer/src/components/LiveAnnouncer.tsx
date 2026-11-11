import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";

export const LiveAnnouncer = observer(() => {
  const app = useAppStore();
  const announcement = app.announcer.current;

  return (
    <div
      role="status"
      aria-atomic="true"
      css={{
        position: "absolute",
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
        border: 0
      }}
    >
      {announcement && <span key={announcement.id}>{announcement.text}</span>}
    </div>
  );
});
