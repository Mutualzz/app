import { observer } from "mobx-react-lite";
import { Divider, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { Button } from "@components/Button.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { type ChangeEvent, useRef, useState } from "react";
import Snowflake from "@utils/Snowflake.ts";
import { ExpressionType } from "@mutualzz/types";
import { generateHash } from "@utils/index.ts";
import { useModal } from "@contexts/Modal.context.tsx";
import { ExpressionEditor } from "@components/Modals/ExpressionEditor.tsx";
import { Paper } from "@components/Paper.tsx";
import type { Expression } from "@stores/objects/Expression.ts";
import { AnimatedStack } from "@components/Animated/AnimatedStack.tsx";
import { dynamicElevation, formatColor } from "@mutualzz/ui-core";
import { IconButton } from "@components/IconButton.tsx";
import { FaTrash } from "react-icons/fa";

const EmojiItem = observer(({ expression }: { expression: Expression }) => {
    const { theme } = useTheme();

    const [hover, setHover] = useState(false);

    return (
        <AnimatedStack
            flex={1}
            direction="row"
            alignItems="center"
            whileHover={{
                background: formatColor(
                    dynamicElevation(theme.colors.surface, 5),
                    {
                        alpha: 0.5,
                    },
                ),
            }}
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            p="1rem"
        >
            <Stack direction="row" spacing={6.5} alignItems="center">
                <img
                    alt={expression.id}
                    src={expression.url}
                    css={{
                        width: 32,
                        height: 32,
                    }}
                />
                {expression.name}
            </Stack>

            <Stack flex={1} justifyContent="flex-end">
                {hover && (
                    <IconButton
                        onClick={() => expression.delete()}
                        size="sm"
                        color="danger"
                    >
                        <FaTrash />
                    </IconButton>
                )}
            </Stack>
        </AnimatedStack>
    );
});

const UserEmojisTab = observer(() => {
    const app = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { openModal } = useModal();

    const emojis = app.expressions.emojis.filter(
        (em) => em.authorId === app.account?.id,
    );

    const staticEmojis = emojis.filter((e) => !e.animated);
    const animatedEmojis = emojis.filter((e) => e.animated);

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
            <ExpressionEditor expression={emoji} file={file} />,
        );
    };

    return (
        <Stack direction="column" spacing={2.5}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Stack direction="column">
                    <Typography color="warning" variant="plain">
                        Sadly current limit of emojis you can upload are 100,
                        since the app is in beta and storage is an issue for now
                    </Typography>
                    <Typography textColor="muted" level="body-sm" mb={1.25}>
                        {100 - emojis.length} slots available
                    </Typography>
                </Stack>
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
                    disabled={emojis.length === 100}
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
                    </Stack>
                    <Divider
                        lineColor="muted"
                        css={{
                            opacity: 0.5,
                        }}
                    />

                    <Stack
                        mb={2.5}
                        spacing={5}
                        direction="row"
                        mt={2.5}
                        pl={2.5}
                    >
                        <Typography>Image</Typography>
                        <Typography flex={1}>Name</Typography>
                    </Stack>
                    <Stack direction="column">
                        {staticEmojis.map((expression) => (
                            <EmojiItem expression={expression} />
                        ))}
                    </Stack>
                </Paper>
            )}

            {animatedEmojis.length > 0 && (
                <Paper
                    borderRadius={12}
                    variant="outlined"
                    direction="column"
                    height={200}
                    width={400}
                >
                    <Stack direction="column" spacing={0}>
                        <Typography level="body-lg" ml={2.5} mt={2.5}>
                            Animated Emojis
                        </Typography>
                    </Stack>
                    <Divider
                        lineColor="muted"
                        css={{
                            opacity: 0.5,
                        }}
                    />

                    <Stack
                        mb={2.5}
                        spacing={5}
                        direction="row"
                        mt={2.5}
                        pl={2.5}
                    >
                        <Typography>Image</Typography>
                        <Typography flex={1}>Name</Typography>
                    </Stack>
                    <Stack direction="column">
                        {animatedEmojis.map((expression) => (
                            <EmojiItem expression={expression} />
                        ))}
                    </Stack>
                </Paper>
            )}

            {emojis.length === 0 && (
                <Stack justifyContent="center" alignItems="center" py="4rem">
                    <Typography textAlign="center" color="muted">
                        No emojis created yet
                    </Typography>
                </Stack>
            )}
        </Stack>
    );
});
export default UserEmojisTab;
