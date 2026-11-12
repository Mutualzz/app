import { Stack } from "@mutualzz/ui-web";
import { Fragment, type ReactNode } from "react";

const TEXT_WIDTHS = ["72%", "48%", "86%", "38%", "64%", "55%", "92%", "44%"];
const NAME_WIDTHS = [96, 128, 80, 112, 104, 72];

export const pickTextWidth = (index: number, offset = 0) =>
  TEXT_WIDTHS[(index + offset) % TEXT_WIDTHS.length];

export const pickNameWidth = (index: number, offset = 0) =>
  NAME_WIDTHS[(index + offset) % NAME_WIDTHS.length];

interface SkeletonGroupProps {
  label: string;
  count?: number;
  spacing?: number;
  maxWidth?: number | string;
  render: (index: number) => ReactNode;
}

export const SkeletonGroup = ({
  label,
  count = 3,
  spacing = 1.25,
  maxWidth,
  render
}: SkeletonGroupProps) => (
  <Stack
    direction="column"
    spacing={spacing}
    width="100%"
    maxWidth={maxWidth}
    role="status"
    aria-busy="true"
    aria-label={label}
  >
    {Array.from({ length: count }, (_item, index) => (
      <Fragment key={index}>{render(index)}</Fragment>
    ))}
  </Stack>
);
