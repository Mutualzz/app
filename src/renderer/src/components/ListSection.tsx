import { Box, IconSlot, Stack, Typography } from "@mutualzz/ui-web";
import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useState, type ReactNode } from "react";

interface Props {
  name: string;
  items: ReactNode[];
}

interface ListSectionHeaderProps {
  name: string;
  open: boolean;
  onToggle: () => void;
}

export const ListSectionHeader = ({
  name,
  open,
  onToggle
}: ListSectionHeaderProps) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    role="button"
    onClick={onToggle}
    css={{
      cursor: "pointer",
      userSelect: "none"
    }}
  >
    <Typography level="label-xs">{name}</Typography>
    <IconSlot size={12}>
      {open ? (
        <CaretDownIcon weight="bold" />
      ) : (
        <CaretRightIcon weight="bold" />
      )}
    </IconSlot>
  </Stack>
);

export const ListSection = (props: Props) => {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <Box p="24px 8px 0 8px">
      <ListSectionHeader name={props.name} open={open} onToggle={toggle} />
      {open && (
        <Stack direction="column" spacing={1.25}>
          {...props.items}
        </Stack>
      )}
    </Box>
  );
};
