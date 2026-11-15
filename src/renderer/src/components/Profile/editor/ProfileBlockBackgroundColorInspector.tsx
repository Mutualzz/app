import { ProfileInspectorField } from "@components/Profile/editor/ProfileInspectorField";
import type { APIProfileBlock } from "@mutualzz/types";
import {
  supportsProfileBlockBackgroundColor,
  type ColorLike
} from "@mutualzz/ui-core";
import { Input } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  block: APIProfileBlock;
  updateSelectedBlock: (patch: Partial<APIProfileBlock>) => void;
}

export const ProfileBlockBackgroundColorInspector = observer(
  ({ block, updateSelectedBlock }: Props) => {
    const { t } = useTranslation("settings");

    if (!supportsProfileBlockBackgroundColor(block.type)) {
      return null;
    }

    return (
      <ProfileInspectorField
        label={t("profile.inspector.backgroundColor")}
        hint={t("profile.inspector.blockBackgroundColorDescription")}
        onReset={
          block.backgroundColor
            ? () => updateSelectedBlock({ backgroundColor: null })
            : undefined
        }
      >
        <Input
          type="color"
          name="blockBackgroundColor"
          textColor="primary"
          size="sm"
          value={(block.backgroundColor as ColorLike | undefined) ?? "#1a1a2e"}
          allowGradient
          onChange={(color: ColorLike) => {
            if (typeof color !== "string" || !color) return;
            updateSelectedBlock({ backgroundColor: color });
          }}
          fullWidth
        />
      </ProfileInspectorField>
    );
  }
);
