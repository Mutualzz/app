import type { APIRole } from "@mutualzz/types";
import { InputWithLabel } from "@components/InputWithLabel";
import { SettingsToggleRow } from "@components/UserSettings/SettingsField";
import { Divider, Stack } from "@mutualzz/ui-web";
import { useTranslation } from "react-i18next";

interface Props {
  changes: Partial<Omit<APIRole, "id">>;
  setChanges: (
    next:
      | Partial<Omit<APIRole, "id">>
      | ((prev: Partial<Omit<APIRole, "id">>) => Partial<Omit<APIRole, "id">>)
  ) => void;
}

export const SpaceRoleEditDisplay = ({ changes, setChanges }: Props) => {
  const { t } = useTranslation("space");

  return (
    <Stack direction="column" spacing={5}>
      <InputWithLabel
        name="name"
        label={t("roles.display.roleName")}
        required
        type="text"
        onChange={(e) => {
          const value = e.target.value;
          setChanges((prev) => ({
            ...prev,
            name: value
          }));
        }}
        value={changes.name ?? ""}
      />
      <Divider css={{ opacity: 0.5 }} />
      <InputWithLabel
        name="color"
        label={t("roles.display.roleColor")}
        type="color"
        value={changes.color ?? "#ffffff"}
        onChangeResult={(result) => {
          setChanges((prev) => ({
            ...prev,
            color: result.hex?.startsWith("#") ? result.hex : `#${result.hex}`
          }));
        }}
      />
      <Divider css={{ opacity: 0.5 }} />
      <SettingsToggleRow
        title={t("roles.display.hoist")}
        checked={!!changes.hoist}
        onChange={(hoist) =>
          setChanges((prev) => ({
            ...prev,
            hoist
          }))
        }
      />
      <Divider css={{ opacity: 0.5 }} />
      <SettingsToggleRow
        title={t("roles.display.mentionable")}
        description={t("roles.display.mentionableHint")}
        checked={!!changes.mentionable}
        onChange={(mentionable) =>
          setChanges((prev) => ({
            ...prev,
            mentionable
          }))
        }
      />
    </Stack>
  );
};
