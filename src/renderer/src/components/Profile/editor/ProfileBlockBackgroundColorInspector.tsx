import type { APIProfileBlock } from "@mutualzz/types";
import {
  supportsProfileBlockBackgroundColor,
  type ColorLike,
} from "@mutualzz/ui-core";
import { Button, Stack } from "@mutualzz/ui-web";
import { InputWithLabel } from "@components/InputWithLabel";
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
      <Stack direction="column" spacing={1}>
        <InputWithLabel
          type="color"
          label={t("profile.inspector.backgroundColor")}
          name="blockBackgroundColor"
          description={t("profile.inspector.blockBackgroundColorDescription")}
          value={(block.backgroundColor as ColorLike | undefined) ?? "#1a1a2e"}
          allowGradient
          onChange={(color: ColorLike) => {
            if (typeof color !== "string" || !color) return;
            updateSelectedBlock({ backgroundColor: color });
          }}
          fullWidth
        />
        {block.backgroundColor ? (
          <Button
            size="sm"
            color="neutral"
            onClick={() => updateSelectedBlock({ backgroundColor: null })}
          >
            {t("profile.inspector.resetBackgroundColor")}
          </Button>
        ) : null}
      </Stack>
    );
  },
);
