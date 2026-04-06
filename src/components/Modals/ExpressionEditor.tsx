import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores.ts";
import { useModal } from "@contexts/Modal.context.tsx";
import { useState } from "react";
import { InputDefault, Stack } from "@mutualzz/ui-web";
import type { APIExpression } from "@mutualzz/types";
import { Button } from "@components/Button.tsx";
import { Expression } from "@stores/objects/Expression.ts";
import type { Area, Point } from "react-easy-crop";
import { useMutation } from "@tanstack/react-query";

// File needs to be passed
interface Props {
    expression: APIExpression;
    file: File;
}

export const ExpressionEditor = observer(({ expression, file }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();

    const [name, setName] = useState(expression.name);

    const [crop, setCrop] = useState<Point>({
        x: 0,
        y: 0,
    });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    const [croppedAreaPixels, setCroppedAreaPixels] =
        useState<Partial<Area> | null>(null);

    const { mutate: createEmoji, isPending: creating } = useMutation({
        mutationKey: ["create-emoji", emoji.authorId, name, emoji.type],
        mutationFn: async () => {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("type", emoji.type.toString());
            if (emoji.spaceId) formData.append("spaceId", emoji.spaceId);
        },
        onError: (err: HttpException) => {
            err.errors?.forEach((error) => {
                setErrors((prev) => ({
                    ...prev,
                    [error.path]: error.message,
                }));
            });
        },
    });

    const previewUrl = file
        ? URL.createObjectURL(file)
        : Expression.constructUrl(emoji.id, emoji.animated, emoji.assetHash);

    const handleUpload = () => {
        if (!file) return;

        if (name.trim() === "") {
            setErrors({
                name: "Emoji name cannot be empty",
            });
            return;
        }
    };

    const handleUpdate = () => {};

    return (
        <Stack direction="row" spacing={2.5}>
            <img
                src={previewUrl}
                alt={name}
                css={{
                    width: 128,
                    height: 128,
                }}
            />

            <Stack direction="column">
                <InputDefault
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Emoji name"
                />

                <Stack direction="row" spacing={1.25}>
                    {file ? (
                        <Button onClick={handleUpload} color="success">
                            Upload
                        </Button>
                    ) : (
                        <Button onClick={handleUpdate} color="info">
                            Update
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
});
