import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Typography, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

export const RateLimitError = observer(() => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { closeAllModals } = useModal();

    return (
        <Paper
            p={4}
            elevation={app.settings?.preferEmbossed ? 8 : 1}
            justifyContent="center"
            maxWidth={500}
            width="100%"
            height="100%"
            direction="column"
            borderRadius={4}
            border={`1px solid ${theme.colors.danger} !important`}
        >
            <Typography
                p={5}
                variant="plain"
                color="danger"
                level="h6"
                textAlign="center"
            >
                Slow down there! You're sending requests too quickly.
            </Typography>
            <Button fullWidth color="neutral" onClick={() => closeAllModals()}>
                Close
            </Button>
        </Paper>
    );
});
