import { type FC, useEffect } from "react";
import { useModal } from "@contexts/Modal.context";
import { Button, Paper, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";

interface Props {
    type: "muted" | "deafened";
}

export const SpaceModerated: FC<Props> = ({ type }) => {
    const app = useAppStore();
    const { closeModal } = useModal();

    useEffect(() => {
        if (type !== "muted" && type !== "deafened") closeModal();
    }, []);

    if (type !== "muted" && type !== "deafened") return null;

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            width="25rem"
            px={8}
            py={4}
            borderRadius={12}
            direction="column"
            spacing={2.5}
        >
            <Typography level="h5" fontWeight="bold">
                Space {type === "muted" ? "Muted" : "Deafened"}
            </Typography>
            <Typography>
                This channel has special permissions. To{" "}
                {type === "muted" ? "speak in it" : "listen in it"}, you'll need
                someone, like a space moderator or admin to{" "}
                {type === "muted" ? "unmute" : "undeafen"} you
            </Typography>
            <Button onClick={() => closeModal()}>Alrighty!</Button>
        </Paper>
    );
};
