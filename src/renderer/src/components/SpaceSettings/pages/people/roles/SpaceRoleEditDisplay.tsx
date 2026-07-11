import type { APIRole } from "@mutualzz/types";
import { Box, Divider, Stack, Switch, Typography } from "@mutualzz/ui-web";
import { InputWithLabel } from "@components/InputWithLabel";
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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Typography textColor="secondary">
          {t("roles.display.hoist")}
        </Typography>
        <Box mr={2}>
          <Switch
            checked={changes.hoist}
            onChange={() => {
              setChanges((prev) => ({
                ...prev,
                hoist: !prev.hoist
              }));
            }}
          />
        </Box>
      </Stack>
      <Divider css={{ opacity: 0.5 }} />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Stack direction="column" spacing={1.25}>
          <Typography textColor="secondary">
            {t("roles.display.mentionable")}
          </Typography>
          <Typography level="body-sm">
            {t("roles.display.mentionableHint")}
          </Typography>
        </Stack>
        <Box mr={2}>
          <Switch
            checked={changes.mentionable}
            onChange={() => {
              setChanges((prev) => ({
                ...prev,
                mentionable: !prev.mentionable
              }));
            }}
          />
        </Box>
      </Stack>
    </Stack>
  );
};
