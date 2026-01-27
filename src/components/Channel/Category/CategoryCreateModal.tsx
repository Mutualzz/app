import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { ChannelType, HttpException } from "@mutualzz/types";
import {
    Button,
    ButtonGroup,
    Input,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FaFolder } from "react-icons/fa";

interface Props {
    space: Space;
}

export const CategoryCreateModal = observer(({ space }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const [name, setName] = useState("");
    const [errors, setErrors] = useState<{ name?: string }>({});

    const { mutate: createCategory, isPending: isCreating } = useMutation({
        mutationKey: ["create-category", space.id, name],
        mutationFn: async () => space.createChannel(name, ChannelType.Category),
        onSuccess: () => {
            closeModal();
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

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            borderRadius={8}
            minWidth={{ xs: "90vw", sm: 150, md: 200, lg: 400 }}
            maxWidth={400}
            direction="column"
            minHeight={250}
            transparency={65}
            justifyContent="space-between"
            width="100%"
            onKeyDown={(e) => e.key === "Enter" && createCategory()}
            px={5}
        >
            <Stack direction="column" my="auto" spacing={1.25}>
                <Stack direction="column" spacing={1.25}>
                    <Typography>Category Name</Typography>
                    <Input
                        startDecorator={<FaFolder color="gray" />}
                        fullWidth
                        color="neutral"
                        name="channel-name"
                        type="text"
                        autoComplete="off"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && (
                        <Typography color="danger">{errors.name}</Typography>
                    )}
                </Stack>
            </Stack>
            <Stack width="100%" mx="auto" mb={5} spacing={1.25}>
                <ButtonGroup fullWidth spacing={1.25}>
                    <Button
                        color="neutral"
                        variant="soft"
                        onClick={() => closeModal()}
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isCreating || name.length === 0}
                        onClick={() => createCategory()}
                    >
                        Create Category
                    </Button>
                </ButtonGroup>
            </Stack>
        </Paper>
    );
});
