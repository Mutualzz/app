import { Paper } from "@components/Paper";
import { Tooltip } from "@components/Tooltip";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { keyframes } from "@emotion/react";
import type { InventorySlot } from "@hooks/useBridgeInventory";
import { useAppStore } from "@hooks/useStores";
import { Typography, useTheme } from "@mutualzz/ui-web";
import { CircleNotchIcon, ClockIcon } from "@phosphor-icons/react";
import type { SlotContainer } from "@renderer/hooks/useInventoryEdits";
import { useCallback } from "react";
import { SlotIcon } from "./ItemIcons";
import { itemName, SLOT_SIZE, type SlotEditing } from "./inventoryUtils";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const glow = keyframes`
  from { box-shadow: 0 0 0 3px var(--slot-flash); }
  to { box-shadow: 0 0 0 3px transparent; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-3px); }
  40%, 80% { transform: translateX(3px); }
`;

interface SlotProps {
  id: string;
  item?: InventorySlot;
  editable: boolean;
  pending: boolean;
  selected: boolean;
  live: boolean;
  flash?: "ok" | "fail";
  onSelect?: () => void;
}

const Slot = ({
  id,
  item,
  editable,
  pending,
  selected,
  live,
  flash,
  onSelect
}: SlotProps) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const drag = useDraggable({
    id,
    data: { item },
    disabled: !editable || !item
  });
  const drop = useDroppable({ id, disabled: !editable });

  const { setNodeRef: setDragRef } = drag;
  const { setNodeRef: setDropRef } = drop;
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node);
      setDropRef(node);
    },
    [setDragRef, setDropRef]
  );

  const cell = (
    <Paper
      elevation={app.settings?.preferEmbossed ? 3 : 1}
      borderRadius={6}
      direction="column"
      alignItems="center"
      justifyContent="center"
      position="relative"
      p={0.5}
    >
      {item && (
        <>
          <SlotIcon key={item.type} type={item.type} />
          {item.amount > 1 && (
            <Typography
              level="body-xs"
              weight="bold"
              css={{
                position: "absolute",
                right: 4,
                bottom: 2,
                textShadow: "1px 1px 0 #000"
              }}
            >
              {item.amount}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );

  return (
    <div
      ref={setRef}
      {...drag.attributes}
      {...drag.listeners}
      onClick={editable ? onSelect : undefined}
      style={{
        display: "grid",
        position: "relative",
        borderRadius: 6,
        opacity: drag.isDragging ? 0.3 : pending ? 0.6 : 1,
        outline: selected
          ? `2px solid ${theme.colors.primary}`
          : drop.isOver
            ? `2px dashed ${theme.colors.primary}`
            : "none",
        cursor: !editable ? "default" : item ? "grab" : "pointer"
      }}
      css={{
        "--slot-flash":
          flash === "fail" ? theme.colors.danger : theme.colors.success,
        animation:
          flash === "fail"
            ? `${shake} 0.4s ease, ${glow} 1.2s ease-out`
            : flash === "ok"
              ? `${glow} 1.2s ease-out`
              : undefined
      }}
    >
      {item ? (
        <Tooltip
          content={`${itemName(item.type)} ×${item.amount}`}
          placement="top"
        >
          {cell}
        </Tooltip>
      ) : (
        cell
      )}
      {pending && (
        <div
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            display: "flex",
            pointerEvents: "none"
          }}
        >
          {live ? (
            <CircleNotchIcon
              size={12}
              css={{ animation: `${spin} 0.9s linear infinite` }}
            />
          ) : (
            <ClockIcon size={12} />
          )}
        </div>
      )}
    </div>
  );
};

export const SlotGrid = ({
  slots,
  container,
  indexes,
  columns = 9,
  editing
}: {
  slots: InventorySlot[];
  container: SlotContainer;
  indexes: number[];
  columns?: number;
  editing?: SlotEditing;
}) => {
  const bySlot = new Map(slots.map((item) => [item.slot, item]));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, ${SLOT_SIZE}px)`,
        gridAutoRows: `${SLOT_SIZE}px`,
        gap: 4
      }}
    >
      {indexes.map((index) => {
        const key = `${container}:${index}`;
        return (
          <Slot
            key={key}
            id={key}
            item={bySlot.get(index)}
            editable={Boolean(editing)}
            pending={editing?.pending.has(key) ?? false}
            selected={editing?.selected === key}
            live={editing?.live ?? false}
            flash={
              editing?.flash?.has(key)
                ? editing.flash.get(key)
                  ? "ok"
                  : "fail"
                : undefined
            }
            onSelect={() => editing?.onSelect(key)}
          />
        );
      })}
    </div>
  );
};
