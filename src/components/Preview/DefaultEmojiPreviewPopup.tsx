import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores.ts";
import type { CSSObject } from "@emotion/react";
import { Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper.tsx";

interface Props {
    name: string;
    url: string;
    css?: CSSObject;
}

export const DefaultEmojiPreviewPopup = observer(
    ({ url, name, ...props }: Props) => {
        const app = useAppStore();

        return (
            <Paper
                variant="elevation"
                py={2.5}
                px={2.5}
                elevation={app.settings?.preferEmbossed ? 1 : 3}
                spacing={2.5}
                borderRadius={8}
                width={250}
                direction="column"
                {...props}
            >
                <Stack
                    width="100%"
                    direction="row"
                    spacing={2.5}
                    alignItems="center"
                >
                    <img
                        src={url}
                        alt={name}
                        aria-label={`:${name}:`}
                        draggable={false}
                        css={{
                            width: 48,
                            height: 48,
                        }}
                    />

                    <Stack spacing={1.25} direction="column">
                        <Typography level="body-sm" textColor="accent">
                            :{name}:
                        </Typography>
                        <Typography level="body-xs">
                            This is a default emoji. You can use it anywhere on
                            Mutualzz
                        </Typography>
                    </Stack>
                </Stack>
            </Paper>
        );
    },
);
