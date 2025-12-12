import { useModal } from "@contexts/Modal.context";
import { Button, Paper, Typography, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react";

export const RateLimitError = observer(() => {
    const { theme } = useTheme();
    const { closeAllModals } = useModal();

    return (
        <Paper
            p={4}
            elevation={4}
            justifyContent="center"
            maxWidth={500}
            width="100%"
            height="100%"
            direction="column"
            borderRadius={4}
            border={`1px solid ${theme.colors.danger}`}
        >
            <Typography p={5} level="h6" textAlign="center">
                Slow down there! You're sending requests too quickly.
            </Typography>
            <Button fullWidth color="success" onClick={() => closeAllModals()}>
                Close
            </Button>
        </Paper>
    );
});
