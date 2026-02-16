import type { APIRole } from "@mutualzz/types";
import { Box, Divider, Stack, Switch, Typography } from "@mutualzz/ui-web";
import { InputWithLabel } from "@components/InputWithLabel.tsx";

interface Props {
    changes: Partial<Omit<APIRole, "id">>;
    setChanges: (
        next:
            | Partial<Omit<APIRole, "id">>
            | ((
                  prev: Partial<Omit<APIRole, "id">>,
              ) => Partial<Omit<APIRole, "id">>),
    ) => void;
}

export const SpaceRoleEditDisplay = ({ changes, setChanges }: Props) => {
    return (
        <Stack direction="column" spacing={5}>
            <InputWithLabel
                name="name"
                label="Role name"
                required
                type="text"
                onChange={(e) => {
                    const value = e.target.value;
                    setChanges((prev) => ({
                        ...prev,
                        name: value,
                    }));
                }}
                value={changes.name ?? ""}
            />
            <Divider css={{ opacity: 0.5 }} />
            <InputWithLabel
                name="color"
                label="Role color"
                type="color"
                value={changes.color ?? "#ffffff"}
                onChangeResult={(result) => {
                    setChanges((prev) => ({
                        ...prev,
                        color: result.hex?.startsWith("#")
                            ? result.hex
                            : `#${result.hex}`,
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
                    Display role members separately from online members
                </Typography>
                <Box mr={2}>
                    <Switch
                        checked={changes.hoist}
                        onChange={() => {
                            setChanges((prev) => ({
                                ...prev,
                                hoist: !prev.hoist,
                            }));
                        }}
                    />
                </Box>
            </Stack>
        </Stack>
    );
};
