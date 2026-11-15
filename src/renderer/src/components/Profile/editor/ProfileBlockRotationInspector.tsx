import { ProfileInspectorField } from "@components/Profile/editor/ProfileInspectorField";
import type { APIProfileBlock } from "@mutualzz/types";
import {
  PROFILE_BLOCK_ROTATION_MAX,
  supportsProfileBlockRotation
} from "@mutualzz/ui-core";
import { Slider } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  block: APIProfileBlock;
  updateSelectedBlock: (patch: Partial<APIProfileBlock>) => void;
}

export const ProfileBlockRotationInspector = observer(
  ({ block, updateSelectedBlock }: Props) => {
    const { t } = useTranslation("settings");

    if (!supportsProfileBlockRotation(block.type)) return null;

    const rotation = block.rotation ?? 0;

    return (
      <ProfileInspectorField
        label={t("profile.inspector.fields.rotation")}
        value={`${rotation}°`}
        onReset={
          rotation !== 0
            ? () => updateSelectedBlock({ rotation: undefined })
            : undefined
        }
      >
        <Slider
          min={-PROFILE_BLOCK_ROTATION_MAX}
          max={PROFILE_BLOCK_ROTATION_MAX}
          step={1}
          value={rotation}
          onChange={(_, value) =>
            updateSelectedBlock({
              rotation: (value as number) === 0 ? undefined : (value as number)
            })
          }
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}°`}
        />
      </ProfileInspectorField>
    );
  }
);
