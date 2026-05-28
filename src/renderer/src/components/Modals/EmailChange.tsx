import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { InputWithLabel } from "@components/InputWithLabel";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { useMutation } from "@tanstack/react-query";
import { HttpException } from "@mutualzz/types";
import { Paper } from "@components/Paper";

export const EmailChange = observer(() => {
    const app = useAppStore();

    const [code, setCode] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const needsCode = app.account?.flags.has("Verified");

    const { closeModal } = useModal();

    const { mutate: changeEmail, isPending: isChanging } = useMutation({
        mutationKey: ["changeEmail", [code, newEmail]],
        mutationFn: () =>
            needsCode
                ? app.rest.post("/@me/change-email", {
                      code,
                      email: newEmail
                  })
                : app.rest.post("/@me/change-email-unverified", {
                      email: newEmail
                  }),
        onSuccess: () => closeModal(),
        onError: (err: HttpException) => {
            err.errors?.forEach((e) => {
                setErrors({
                    [e.path]: e.message
                });
            });
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
                Confirm your current email address
            </Typography>
            {needsCode && (
                <InputWithLabel
                    name="code"
                    label="Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    apiError={errors.code}
                    type="text"
                    required
                />
            )}
            <InputWithLabel
                name="email"
                label="New Email Address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                apiError={errors.email}
                type="text"
                required
            />

            <Stack spacing={1.25}>
                <Button
                    color="neutral"
                    disabled={isChanging}
                    onClick={() => closeModal()}
                    size="lg"
                    expand
                >
                    Cancel
                </Button>
                <Button
                    color="success"
                    onClick={() => changeEmail()}
                    disabled={isChanging}
                    size="lg"
                    expand
                >
                    Confirm
                </Button>
            </Stack>
        </Paper>
    );
});
