import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Button, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";

export const SuccessForgotSent = () => {
    const app = useAppStore();
    const { closeModal } = useModal();

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            width="27.5rem"
            height="10rem"
            p={5}
            borderRadius={12}
            direction="column"
            justifyContent="space-between"
        >
            <Typography level="h5" fontWeight="bold">
                Password Reset Sent
            </Typography>
            <Typography>
                If an account with the provided username or email exists, a
                password reset link has been sent to it.
            </Typography>
            <Button color="neutral" onClick={() => closeModal()}>
                Close
            </Button>
        </Paper>
    );
};
