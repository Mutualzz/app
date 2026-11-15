import { ProfileInspectorField } from "@components/Profile/editor/ProfileInspectorField";
import {
  clampBlock,
  getProfileBlockSizeLimits
} from "@components/Profile/viewer/profileLayout.utils";
import type { APIProfileBlock } from "@mutualzz/types";
import { Slider, Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  block: APIProfileBlock;
  updateSelectedBlock: (patch: Partial<APIProfileBlock>) => void;
}

export const ProfileBlockSizeInspector = observer(
  ({ block, updateSelectedBlock }: Props) => {
    const { t } = useTranslation("settings");
    const limits = getProfileBlockSizeLimits(block.type);

    const setSize = (
      patch: Partial<Pick<APIProfileBlock, "width" | "height">>
    ) => {
      updateSelectedBlock(
        clampBlock({
          ...block,
          ...patch
        })
      );
    };

    return (
      <Stack direction="column" spacing={2}>
        <ProfileInspectorField
          label={t("profile.inspector.fields.width")}
          value={`${Math.round(block.width)}%`}
          hint={t("profile.inspector.fields.widthHint", {
            recommended: limits.recommendedWidth,
            min: limits.minWidth,
            max: limits.maxWidth
          })}
          onReset={
            block.width !== limits.recommendedWidth
              ? () => setSize({ width: limits.recommendedWidth })
              : undefined
          }
          resetLabel={t("profile.inspector.fields.useRecommended")}
        >
          <Slider
            min={limits.minWidth}
            max={limits.maxWidth}
            step={1}
            value={block.width}
            onChange={(_, value) => setSize({ width: value as number })}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
          />
        </ProfileInspectorField>

        <ProfileInspectorField
          label={t("profile.inspector.fields.height")}
          value={`${Math.round(block.height)}%`}
          hint={t("profile.inspector.fields.heightHint", {
            recommended: limits.recommendedHeight,
            min: limits.minHeight,
            max: limits.maxHeight
          })}
          onReset={
            block.height !== limits.recommendedHeight
              ? () => setSize({ height: limits.recommendedHeight })
              : undefined
          }
          resetLabel={t("profile.inspector.fields.useRecommended")}
        >
          <Slider
            min={limits.minHeight}
            max={limits.maxHeight}
            step={1}
            value={block.height}
            onChange={(_, value) => setSize({ height: value as number })}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
          />
        </ProfileInspectorField>
      </Stack>
    );
  }
);
