import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Box, Button, ButtonGroup, Stack, Typography } from "@mutualzz/ui-web";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "@contexts/Modal.context";
import { HttpException } from "@mutualzz/types";
import { InputWithLabel } from "@components/InputWithLabel";

type ChangePasswordErrors = {
    currentPassword: string | undefined;
    newPassword: string | undefined;
    confirmNewPassword: string | undefined;
};

export const ChangePassword = observer(() => {
    const app = useAppStore();
    const { closeModal } = useModal();

    const [values, setValues] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });

    const [errors, setErrors] = useState<ChangePasswordErrors>({
        currentPassword: undefined,
        newPassword: undefined,
        confirmNewPassword: undefined
    });

    const { mutate: changePassword, isPending: changingPassword } = useMutation(
        {
            mutationKey: ["change-password", app.account?.id],
            mutationFn: () =>
                app.rest.post("/@me/change-password", {
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                    confirmNewPassword: values.confirmNewPassword
                }),
            onSuccess: () => {
                console.log("here");
                closeModal();
            },
            onError: (err: HttpException) => {
                if (err.errors?.length > 0) {
                    err.errors.forEach((error) => {
                        setErrors((prevErrors) => ({
                            ...prevErrors,
                            [error.path]: error.message
                        }));
                    });
                }
            }
        }
    );

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            width="30rem"
            height="25rem"
            p={5}
            borderRadius={12}
            direction="column"
            justifyContent="space-between"
            spacing={2.5}
        >
            <Typography level="h5" fontWeight="bold">
                Change Password
            </Typography>
            <Stack direction="column" spacing={5}>
                <InputWithLabel
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                    onChange={(e) =>
                        setValues((prevValues) => ({
                            ...prevValues,
                            currentPassword: e.target.value
                        }))
                    }
                    value={values.currentPassword}
                    required
                    apiError={errors.currentPassword}
                />
                <InputWithLabel
                    name="newPassword"
                    label="New Password"
                    type="password"
                    onChange={(e) =>
                        setValues((prevValues) => ({
                            ...prevValues,
                            newPassword: e.target.value
                        }))
                    }
                    value={values.newPassword}
                    required
                    apiError={errors.newPassword}
                />
                <InputWithLabel
                    name="confirmNewPassword"
                    label="Confirm New Password"
                    type="password"
                    onChange={(e) =>
                        setValues((prevValues) => ({
                            ...prevValues,
                            confirmNewPassword: e.target.value
                        }))
                    }
                    value={values.confirmNewPassword}
                    required
                    apiError={errors.confirmNewPassword}
                />
            </Stack>
            <Box>
                <ButtonGroup fullWidth size="lg" spacing={5}>
                    <Button
                        color="neutral"
                        disabled={changingPassword}
                        onClick={() => closeModal()}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="success"
                        onClick={() => changePassword()}
                        disabled={changingPassword}
                    >
                        Change
                    </Button>
                </ButtonGroup>
            </Box>
        </Paper>
    );
});
