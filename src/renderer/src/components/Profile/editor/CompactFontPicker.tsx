import { Button } from "@components/Button";
import { GoogleFontPicker } from "@components/FontPicker/GoogleFontPicker";
import { ProfileInspectorField } from "@components/Profile/editor/ProfileInspectorField";
import { Popover, Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const POPOVER_WIDTH = 320;

interface Props {
  label: string;
  description?: string;
  fontOwnerId?: string | null;
  value: string | null | undefined;
  allowClear?: boolean;
  onChange: (font: string | null) => void;
}

export const CompactFontPicker = observer(
  ({ label, description, fontOwnerId, value, allowClear, onChange }: Props) => {
    const { t } = useTranslation("settings");
    const [open, setOpen] = useState(false);

    const currentName = !value
      ? t("profile.inspector.fontDefault")
      : value.startsWith("font:")
        ? t("fonts.uploaded")
        : value;

    return (
      <ProfileInspectorField
        label={label}
        hint={description}
        onReset={allowClear && value ? () => onChange(null) : undefined}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            level="body-sm"
            css={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {currentName}
          </Typography>
          <Popover
            placement="right"
            align="start"
            isOpen={open}
            onOpenChange={setOpen}
            closeOnClickOutside
            surfaceRole="popout"
            elevation={8}
            p={1.5}
            width={POPOVER_WIDTH}
            css={{ width: POPOVER_WIDTH, maxHeight: 480, overflowY: "auto" }}
            trigger={
              <Button size="sm" color="neutral">
                {t("profile.inspector.change")}
              </Button>
            }
          >
            <GoogleFontPicker
              label={label}
              fontOwnerId={fontOwnerId ?? undefined}
              value={value ?? null}
              allowClear={allowClear}
              onChange={(font) => {
                onChange(font ?? null);
                setOpen(false);
              }}
            />
          </Popover>
        </Stack>
      </ProfileInspectorField>
    );
  }
);
