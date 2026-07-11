import type { APIProfileBlock } from "@mutualzz/types";
import {
  clampProfileBlockCornerRadius,
  isCustomProfileBlockCornerRadius,
  PROFILE_BLOCK_CORNER_RADIUS_MAX,
  PROFILE_BLOCK_CORNER_RADIUS_MIN,
  resolveProfileBlockCornerRadius,
} from "@mutualzz/ui-core";
import { Button, Slider, Stack, Typography } from "@mutualzz/ui-web";
import { ArrowsCounterClockwiseIcon } from "@phosphor-icons/react";
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

export const ProfileBlockCornerRadiusInspector = observer(
  ({ block, updateSelectedBlock }: Props) => {
    const { t } = useTranslation("settings");
    const radius = resolveProfileBlockCornerRadius(block, "desktop");
    const isCustom = isCustomProfileBlockCornerRadius(block);

    return (
      <Stack direction="column" spacing={1}>
        <FieldLabel>
          {t("profile.inspector.cornerRadius.title", { value: radius })}
        </FieldLabel>
        <FieldHint>
          {t("profile.inspector.cornerRadius.hint", {
            min: PROFILE_BLOCK_CORNER_RADIUS_MIN,
            max: PROFILE_BLOCK_CORNER_RADIUS_MAX
          })}
        </FieldHint>
        <Slider
          min={PROFILE_BLOCK_CORNER_RADIUS_MIN}
          max={PROFILE_BLOCK_CORNER_RADIUS_MAX}
          step={1}
          value={radius}
          onChange={(_, value) =>
            updateSelectedBlock({
              cornerRadius: clampProfileBlockCornerRadius(value as number),
            })
          }
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}px`}
        />
        {isCustom && (
          <Button
            size="sm"
            color="neutral"
            startDecorator={<ArrowsCounterClockwiseIcon />}
            onClick={() =>
              updateSelectedBlock({
                cornerRadius: undefined,
              } as Partial<APIProfileBlock>)
            }
          >
            {t("profile.inspector.cornerRadius.resetToDefault")}
          </Button>
        )}
      </Stack>
    );
  },
);
