import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores.ts";
import { useModal } from "@contexts/Modal.context.tsx";
import { useState } from "react";
import { InputDefault, Stack } from "@mutualzz/ui-web";
import type { APIExpression } from "@mutualzz/types";
import { Button } from "@components/Button.tsx";
import { Expression } from "@stores/objects/Expression.ts";

// If file is existent it will show upload button
interface Props {
    emoji: APIExpression;
    file?: File | null;
}

export const EmojiEditor = observer(({ emoji, file }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();

    const [name, setName] = useState(emoji.name);

    const previewUrl = file
        ? URL.createObjectURL(file)
        : Expression.constructUrl(emoji.id, emoji.animated, emoji.assetHash);

    const handleSaveLocally = () => {
        if (!file) return;

        const newEmoji = { ...emoji, name };

        app.expressions.addLocal(newEmoji, file);
    };

    const handleUpload = () => {
        if (!file) return;
    };

    return (
        <Stack direction="column" spacing={2.5}>
            <img
                src={previewUrl}
                alt={name}
                css={{
                    width: 128,
                    height: 128,
                }}
            />

            <InputDefault
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Emoji name"
            />

            <Stack direction="row" spacing={1.25}>
                <Button onClick={handleSaveLocally} disabled={!file}>
                    Save Locally
                </Button>
                {file && (
                    <Button onClick={handleUpload} color="success">
                        Upload
                    </Button>
                )}
            </Stack>
        </Stack>
    );
});
