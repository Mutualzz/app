import { Box, IconSlot, Stack, Typography } from "@mutualzz/ui-web";
import { type ReactNode, useState } from "react";
import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";

interface Props {
  name: string;
  items: ReactNode[];
}

export const ListSection = (props: Props) => {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <Box p="24px 8px 0 8px">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        role="button"
        onClick={toggle}
        css={{
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        <Typography level="label-xs">{props.name}</Typography>
        <IconSlot size={12}>
          {open ? (
            <CaretDownIcon weight="bold" />
          ) : (
            <CaretRightIcon weight="bold" />
          )}
        </IconSlot>
      </Stack>
      {open && (
        <Stack direction="column" spacing={1.25}>
          {...props.items}
        </Stack>
      )}
    </Box>
  );
};
