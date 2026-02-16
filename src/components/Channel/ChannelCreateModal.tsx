import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { ChannelType, type HttpException } from "@mutualzz/types";
import { ButtonGroup, Input, Radio, Stack, Typography } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FaHashtag, FaVolumeUp } from "react-icons/fa";
import { ChannelIcon } from "./ChannelIcon";
import { Button } from "@components/Button";

interface Props {
    // Usually a category channel under which to create a new channel
    space: Space;
    parent?: Channel;
}

interface Errors {
    name?: string;
    type?: string;
}

export const ChannelCreateModal = observer(({ space, parent }: Props) => {
    const app = useAppStore();
    const navigate = useNavigate();
    const { closeModal } = useModal();
    const [name, setName] = useState("");
    const [type, setType] = useState<ChannelType>(0);

    const [errors, setErrors] = useState<Errors>({});

    const { mutate: createChannel, isPending: isCreating } = useMutation({
        mutationKey: ["create-channel", space.id, parent?.id, name, type],
        mutationFn: async () =>
            space.createChannel(name, type, parent?.id ?? undefined),
        onSuccess: (newChannel) => {
            if (!newChannel.spaceId) return;
            closeModal();
            if (newChannel.type !== ChannelType.Text) return;
            navigate({
                to: "/spaces/$spaceId/$channelId",
                params: {
                    spaceId: newChannel.spaceId,
                    channelId: newChannel.id,
                },
                replace: true,
            });
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
            minWidth={{ xs: "90vw", sm: 150, md: 200, lg: 500 }}
            maxWidth={600}
            direction="column"
            minHeight={400}
            justifyContent="space-between"
            width="100%"
            onKeyDown={(e) => e.key === "Enter" && createChannel()}
            px={5}
            transparency={65}
        >
            <Stack direction="column" my="auto" spacing={3}>
                <Stack direction="column" spacing={1.25}>
                    <Typography>Channel Name</Typography>
                    <Input
                        startDecorator={
                            <ChannelIcon type={type} color="gray" />
                        }
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
                <Paper
                    p={2}
                    variant="outlined"
                    borderRadius={6}
                    direction="column"
                    color="neutral"
                >
                    <Typography ml={0.5} mb={1}>
                        Channel Type
                    </Typography>
                    <ButtonGroup
                        variant="plain"
                        value={type}
                        onChange={(value) => setType(value)}
                        orientation="vertical"
                        color="neutral"
                        spacing={5}
                        toggleable
                        exclusive
                        fullWidth
                        horizontalAlign="left"
                    >
                        <Button value={0}>
                            <Stack direction="row" textAlign="left" spacing={2}>
                                <Radio
                                    variant="outlined"
                                    color="neutral"
                                    checked={type === 0}
                                />
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                >
                                    <FaHashtag />
                                    <Stack direction="column" spacing={1}>
                                        <Typography>Text Channel</Typography>
                                        <Typography
                                            level="body-xs"
                                            textColor="secondary"
                                        >
                                            A text channel for messages, images,
                                            and more.
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Button>
                        <Button disabled value={1}>
                            <Stack direction="row" textAlign="left" spacing={2}>
                                <Radio
                                    variant="outlined"
                                    color="neutral"
                                    checked={type === 1}
                                    disabled
                                />
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                >
                                    <FaVolumeUp />
                                    <Stack direction="column" spacing={1}>
                                        <Typography
                                            display="flex"
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            Voice Channel{" "}
                                            <Typography
                                                level="body-xs"
                                                variant="plain"
                                                color="warning"
                                            >
                                                (Not working yet)
                                            </Typography>
                                        </Typography>
                                        <Typography
                                            level="body-xs"
                                            textColor="secondary"
                                        >
                                            A voice channel for voice and video
                                            communication.
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Button>
                    </ButtonGroup>
                    {errors.type && (
                        <Typography color="danger">{errors.type}</Typography>
                    )}
                </Paper>
            </Stack>
            <Stack width="100%" mx="auto" mb={5} spacing={1.25}>
                <ButtonGroup fullWidth spacing={5}>
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
                        onClick={() => createChannel()}
                    >
                        Create Channel
                    </Button>
                </ButtonGroup>
            </Stack>
        </Paper>
    );
});
