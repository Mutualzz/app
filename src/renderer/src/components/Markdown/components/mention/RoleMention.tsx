import { observer } from "mobx-react-lite";
import { Snowflake } from "@mutualzz/types";
import { RenderElementProps } from "slate-react";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";
import { ColorLike } from "@mutualzz/ui-core";

interface Props {
    roleId: Snowflake;
    attributes?: RenderElementProps["attributes"];
}

export const RoleMention = observer(({ roleId, attributes }: Props) => {
    const app = useAppStore();

    const role = app.spaces.active?.roles.get(roleId);

    if (!role) return null;

    return (
        <Stack
            {...attributes}
            contentEditable={false}
            inline
            px={1.25}
            css={{
                background: `${role.color}22`,
                borderRadius: 4,
                userSelect: "none",
                "&:hover": {
                    background: `${role.color}66`
                },
                overflow: "hidden"
            }}
        >
            <Typography textColor={role.color as ColorLike}>
                @{role.name}
            </Typography>
        </Stack>
    );
});
