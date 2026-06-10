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
    return (
      <MzTooltip
        {...props}
        content={
          <TooltipWrapper
            paperProps={paperProps}
            typographyProps={typographyProps}
          >
            {content}
          </TooltipWrapper>
        }
        title={
          <TooltipWrapper
            paperProps={paperProps}
            typographyProps={typographyProps}
          >
            {title}
          </TooltipWrapper>
        }
      />
    );
  }
);
