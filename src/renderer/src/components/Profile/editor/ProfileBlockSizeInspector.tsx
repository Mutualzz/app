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
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation("settings");
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
        <FieldLabel>{t("profile.inspector.size.title")}</FieldLabel>
        <FieldHint>
          {t("profile.inspector.size.recommendedHint", {
            recommendedWidth: limits.recommendedWidth,
            recommendedHeight: limits.recommendedHeight,
            minWidth: limits.minWidth,
            maxWidth: limits.maxWidth,
            minHeight: limits.minHeight,
            maxHeight: limits.maxHeight
          })}
        </FieldHint>

        <FieldLabel>
          {t("profile.inspector.size.width", {
            value: Math.round(block.width)
          })}
        </FieldLabel>
        <Slider
          min={limits.minWidth}
          max={limits.maxWidth}
          step={1}
          value={block.width}
          onChange={(_, value) => setSize({ width: value as number })}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}%`}
        />

        <FieldLabel>
          {t("profile.inspector.size.height", {
            value: Math.round(block.height)
          })}
        </FieldLabel>
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
            {t("profile.inspector.size.useRecommended")}
          </Button>
        )}
      </Stack>
    );
  }
);
