import { AnimatedLogo } from "@components/Animated/AnimatedLogo";
import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { type PillType, SidebarPill } from "@components/SidebarPill";
import { Tooltip } from "@components/Tooltip";
import { useAppStore } from "@hooks/useStores";
import { formatColor } from "@mutualzz/ui-core";
import { Divider, Stack, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import {
  cloneElement,
  type ComponentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useState
} from "react";

export const SIDEBAR_RAIL_WIDTH = "5rem";
export const SIDEBAR_RAIL_ITEM_SIZE = 40;
export const SIDEBAR_RAIL_ICON_SIZE = 20;
export const SIDEBAR_RAIL_USERBAR_WIDTH = "17.5rem";

export const SidebarRailPaper = observer(
  ({ children, ...props }: Omit<ComponentProps<typeof Paper>, "width">) => {
    const app = useAppStore();

    return (
      <Paper
        width={SIDEBAR_RAIL_WIDTH}
        direction="column"
        pt={1}
        pb={1}
        spacing={2}
        variant="plain"
        boxShadow="none !important"
        elevation={app.settings?.preferEmbossed ? 1 : 0}
        alignItems="center"
        height="100%"
        flexShrink={0}
        overflow="hidden"
        {...props}
      >
        {children}
      </Paper>
    );
  }
);

export const SidebarRailSlot = ({
  children,
  pill,
  ...props
}: ComponentProps<typeof Stack> & { pill?: ReactNode }) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    position="relative"
    width={SIDEBAR_RAIL_ITEM_SIZE}
    height={SIDEBAR_RAIL_ITEM_SIZE}
    flexShrink={0}
    {...props}
  >
    {pill}
    {children}
  </Stack>
);

export const SidebarRailScroll = ({
  children,
  ...props
}: ComponentProps<typeof Stack>) => (
  <Stack
    minHeight={0}
    width="100%"
    direction="column"
    alignItems="center"
    spacing={2}
    overflow="auto"
    css={{
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
        display: "none"
      }
    }}
    {...props}
  >
    {children}
  </Stack>
);

export const SidebarRailDivider = () => (
  <Divider
    lineColor="muted"
    css={{ opacity: 0.25, alignSelf: "center", width: "75%", flexShrink: 0 }}
  />
);

const resolvePillType = (
  active: boolean,
  hovered: boolean,
  unread?: boolean
): PillType => {
  if (active) return "active";
  if (unread) return "unread";
  if (hovered) return "hover";
  return "none";
};

export const SidebarRailLogo = observer(
  ({
    tooltip,
    active = false,
    unread = false,
    onClick,
    badge
  }: {
    tooltip: string;
    active?: boolean;
    unread?: boolean;
    onClick?: () => void;
    badge?: ReactNode;
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Tooltip content={tooltip} placement="right">
        <SidebarRailSlot
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          pill={
            <SidebarPill type={resolvePillType(active, isHovered, unread)} />
          }
        >
          <AnimatedLogo
            css={{
              width: SIDEBAR_RAIL_ITEM_SIZE,
              height: SIDEBAR_RAIL_ITEM_SIZE,
              objectFit: "contain",
              cursor: onClick ? "pointer" : undefined,
              display: "block"
            }}
            initial={{ scale: 1 }}
            whileHover={{ scale: onClick ? 1.1 : 1 }}
            onClick={onClick}
          />
          {badge}
        </SidebarRailSlot>
      </Tooltip>
    );
  }
);

export const SidebarRailIconItem = observer(
  ({
    label,
    active = false,
    unread = false,
    onClick,
    children
  }: {
    label: string;
    active?: boolean;
    unread?: boolean;
    onClick: () => void;
    children: ReactElement<{ size?: number; color?: string }>;
  }) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const iconColor = formatColor(theme.typography.colors.primary);
    const icon = isValidElement(children)
      ? cloneElement(children, {
          size: SIDEBAR_RAIL_ICON_SIZE,
          color: iconColor
        })
      : children;

    return (
      <Tooltip content={label} placement="right">
        <SidebarRailSlot
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          pill={
            <SidebarPill type={resolvePillType(active, isHovered, unread)} />
          }
        >
          <IconButton
            variant={active ? "soft" : "plain"}
            color={active ? "primary" : undefined}
            onClick={onClick}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            css={{
              width: SIDEBAR_RAIL_ITEM_SIZE,
              height: SIDEBAR_RAIL_ITEM_SIZE,
              minWidth: SIDEBAR_RAIL_ITEM_SIZE,
              minHeight: SIDEBAR_RAIL_ITEM_SIZE,
              borderRadius: 15,
              color: iconColor,
              cursor: "pointer",
              "& svg": {
                color: iconColor
              }
            }}
          >
            {icon}
          </IconButton>
        </SidebarRailSlot>
      </Tooltip>
    );
  }
);
