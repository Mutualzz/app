import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "@contexts/Modal.context";
import { HttpException } from "@mutualzz/types";
import { InputWithLabel } from "@components/InputWithLabel";

export const EmailVerifyCode = observer(() => {
    const app = useAppStore();
    const { closeModal } = useModal();

    const [code, setCode] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);

    const { mutate: verifyCode, isPending: isVerifying } = useMutation({
        mutationKey: ["verify-code", code],
        mutationFn: async () =>
            app.rest.post("/@me/verify-email", {
                code
            }),
        onSuccess: () => {
            closeModal();
            setError(undefined);
        },
        onError: (err: HttpException) => {
            setError(err.message);
        }
    });

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            p={5}
            borderRadius={12}
            direction="column"
            justifyContent="space-between"
            spacing={2.5}
        >
            <Typography level="h5" fontWeight="bold">
                Email Verification
            </Typography>
            <InputWithLabel
                name="code"
                label="Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                apiError={error}
                type="text"
                required
            />
            <Stack spacing={1.25}>
                <Button
                    color="neutral"
                    disabled={isVerifying}
                    onClick={() => closeModal()}
                    size="lg"
                    expand
                >
                    Cancel
                </Button>
                <Button
                    color="success"
                    onClick={() => verifyCode()}
                    disabled={isVerifying}
                    size="lg"
                    expand
                >
                    Verify
                </Button>
            </Stack>
        </Paper>
    );
});
