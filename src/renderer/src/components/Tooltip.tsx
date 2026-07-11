import {
  type PaperProps,
  Tooltip as MzTooltip,
  TooltipProps,
  type TypographyProps
} from "@mutualzz/ui-web";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { observer } from "mobx-react-lite";

interface Props extends TooltipProps {
  paperProps?: Omit<PaperProps, "color">;
  typographyProps?: TypographyProps;
}

export const Tooltip = observer(
  ({ content, title, paperProps, typographyProps, ...props }: Props) => {
    const label = content ?? title;

    return (
      <MzTooltip
        {...props}
        content={
          label != null ? (
            <TooltipWrapper
              paperProps={paperProps}
              typographyProps={typographyProps}
            >
              {label}
            </TooltipWrapper>
          ) : undefined
        }
      />
    );
  }
);
