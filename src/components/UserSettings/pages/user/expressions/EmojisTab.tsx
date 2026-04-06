import { observer } from "mobx-react-lite";
import { Divider, Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@components/Button.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { type ChangeEvent, useRef } from "react";
import Snowflake from "@utils/Snowflake.ts";
import { ExpressionType } from "@mutualzz/types";
import { generateHash } from "@utils/index.ts";
import { useModal } from "@contexts/Modal.context.tsx";
import { ExpressionEditor } from "@components/Modals/ExpressionEditor.tsx";
import { Paper } from "@components/Paper.tsx";

const EmojisTab = observer(() => {
    const app = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { openModal } = useModal();

    const staticEmojis = app.expressions.emojis.filter((e) => !e.animated);
    const animatedEmojis = app.expressions.emojis.filter((e) => e.animated);

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files?.[0];
        if (!file) return;

        const buffer = await file.arrayBuffer();

        const animated = file.type.includes("gif");
        const hash = await generateHash(buffer, animated);

        const emoji = {
            id: Snowflake.generate(),
            type: ExpressionType.Emoji,
            name: file.name.split(".")[0],
            assetHash: hash,
            spaceId: null,
            authorId: app.account!.id,
            animated,
            flags: 0n,
            createdAt: new Date(),
        };

        openModal(
            "emoji-editor",
            <ExpressionEditor emoji={emoji} file={file} />,
        );
    };

    return (
        <Stack direction="column" spacing={2.5}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Typography color="warning" variant="plain">
                    Sadly current limit of emojis you can upload are 10, since
                    the app is in beta and storage is an issue for now
                </Typography>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/gif,image/png,image/jpeg,image/webp"
                    onChange={handleUpload}
                    multiple={false}
                    css={{
                        display: "none",
                    }}
                />
                <Button
                    color="success"
                    onClick={() => fileInputRef.current?.click()}
                    css={{
                        marginRight: 16,
                    }}
                >
                    Upload Emoji
                </Button>
            </Stack>

            {staticEmojis.length > 0 && (
                <Paper
                    borderRadius={12}
                    variant="outlined"
                    direction="column"
                    height={200}
                    width={400}
                >
                    <Stack direction="column" spacing={0}>
                        <Typography level="body-lg" ml={2.5} mt={2.5}>
                            Emojis
                        </Typography>
                        <Typography
                            textColor="muted"
                            level="body-sm"
                            ml={2.5}
                            mb={1.25}
                        >
                            {10 - app.expressions.emojis.length} slots available
                        </Typography>
                    </Stack>
                    <Divider
                        lineColor="muted"
                        css={{
                            opacity: 0.5,
                        }}
                    />

                    <Stack
                        flex={1}
                        direction="row"
                        mt={2.5}
                        spacing={2}
                        pl={2.5}
                    >
                        <Typography flex={1}>Image</Typography>
                        <Typography flex={1}>Name</Typography>
                        <Typography flex={1}>Local</Typography>
                    </Stack>
                    <Stack direction="column">
                        {staticEmojis.map((expression) => (
                            <img src={expression.url} />
                        ))}
                    </Stack>
                </Paper>
            )}

            {app.expressions.emojis.length === 0 && (
                <Stack justifyContent="center" alignItems="center" py="4rem">
                    <Typography textAlign="center" color="muted">
                        No emojis created yet
                    </Typography>
                </Stack>
            )}
        </Stack>
    );
});
export default EmojisTab;
