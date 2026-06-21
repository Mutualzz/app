import { Button } from "@components/Button";
import {
  applyRecommendedBlockSize,
  clampBlock,
  getProfileBlockSizeLimits
} from "@components/Profile/viewer/profileLayout.utils";
import type { APIProfileBlock } from "@mutualzz/types";
import { Slider, Stack, Typography } from "@mutualzz/ui-web";
import { ArrowsInIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";

interface Props {
  block: APIProfileBlock;
  updateSelectedBlock: (patch: Partial<APIProfileBlock>) => void;
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography level="body-xs" fontWeight={700} css={{ opacity: 0.65 }}>
    {children}
  </Typography>
);

const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <Typography level="body-xs" css={{ opacity: 0.55 }}>
    {children}
  </Typography>
);

export const ProfileBlockSizeInspector = observer(
  ({ block, updateSelectedBlock }: Props) => {
    const limits = getProfileBlockSizeLimits(block.type);
    const isRecommended =
      block.width === limits.recommendedWidth &&
      block.height === limits.recommendedHeight;

    const setSize = (patch: Partial<Pick<APIProfileBlock, "width" | "height">>) => {
      updateSelectedBlock(
        clampBlock({
          ...block,
          ...patch
        } as APIProfileBlock)
      );
    };

    return (
      <Stack direction="column" spacing={1}>
        <FieldLabel>Block size</FieldLabel>
        <FieldHint>
          Recommended {limits.recommendedWidth}% × {limits.recommendedHeight}%
          {" · "}
          Allowed {limits.minWidth}–{limits.maxWidth}% wide,{" "}
          {limits.minHeight}–{limits.maxHeight}% tall
        </FieldHint>

        <FieldLabel>Width ({Math.round(block.width)}%)</FieldLabel>
        <Slider
          min={limits.minWidth}
          max={limits.maxWidth}
          step={1}
          value={block.width}
          onChange={(_, value) => setSize({ width: value as number })}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}%`}
        />

        <FieldLabel>Height ({Math.round(block.height)}%)</FieldLabel>
        <Slider
          min={limits.minHeight}
          max={limits.maxHeight}
          step={1}
          value={block.height}
          onChange={(_, value) => setSize({ height: value as number })}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}%`}
        />

        {!isRecommended && (
          <Button
            size="sm"
            color="neutral"
            startDecorator={<ArrowsInIcon />}
            onClick={() =>
              updateSelectedBlock(applyRecommendedBlockSize(block))
            }
          >
            Use recommended size
          </Button>
        )}
      </Stack>
    );
  }
);
