import { ProfileInspectorField } from "@components/Profile/editor/ProfileInspectorField";
import type { APIProfileBlock } from "@mutualzz/types";
import {
  clampProfileBlockCornerRadius,
  isCustomProfileBlockCornerRadius,
  PROFILE_BLOCK_CORNER_RADIUS_MAX,
  PROFILE_BLOCK_CORNER_RADIUS_MIN,
  resolveProfileBlockCornerRadius
} from "@mutualzz/ui-core";
import { Slider } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  block: APIProfileBlock;
  updateSelectedBlock: (patch: Partial<APIProfileBlock>) => void;
}

export const ProfileBlockCornerRadiusInspector = observer(
  ({ block, updateSelectedBlock }: Props) => {
    const { t } = useTranslation("settings");
    const radius = resolveProfileBlockCornerRadius(block, "desktop");

    return (
      <ProfileInspectorField
        label={t("profile.inspector.fields.cornerRadius")}
        value={`${radius}px`}
        onReset={
          isCustomProfileBlockCornerRadius(block)
            ? () => updateSelectedBlock({ cornerRadius: undefined })
            : undefined
        }
      >
        <Slider
          min={PROFILE_BLOCK_CORNER_RADIUS_MIN}
          max={PROFILE_BLOCK_CORNER_RADIUS_MAX}
          step={1}
          value={radius}
          onChange={(_, value) =>
            updateSelectedBlock({
              cornerRadius: clampProfileBlockCornerRadius(value as number)
            })
          }
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}px`}
        />
      </ProfileInspectorField>
    );
  }
);
