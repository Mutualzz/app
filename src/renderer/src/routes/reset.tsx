import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Paper } from "@components/Paper";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useState } from "react";
import { InputWithLabel } from "@components/InputWithLabel";
import { Button } from "@components/Button";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@hooks/useStores";
import { HttpException } from "@mutualzz/types";

export const Route = createFileRoute("/reset")({
    component: RouteComponent,
    validateSearch: (search) => ({
        token: search.token as string | undefined
    })
});

function RouteComponent() {
    const app = useAppStore();
    const navigate = useNavigate();
    const { token } = Route.useSearch();
    const [error, setError] = useState<string | undefined>(undefined);

    const [values, setValues] = useState({
        password: "",
        confirmPassword: ""
    });

    const { mutate: changePassword, isPending: changingPassword } = useMutation(
        {
            mutationKey: ["changePassword", token],
            mutationFn: () =>
                app.rest.post("/auth/reset-password", {
                    token,
                    ...values
                }),
            onSuccess: () => {
                navigate({
                    to: "/login",
                    replace: true
                });
            },
            onError: (err: HttpException) => {
                setError(err.message);
            }
        }
    );

    if (!token) return <Navigate to="/login" replace />;

    return (
        <Stack
            direction="column"
            width="100%"
            minHeight="100%"
            alignItems="center"
            justifyContent="center"
        >
            <Paper
                direction="column"
                alignItems="center"
                width={{
                    xs: "100%",
                    sm: "90%",
                    md: "70%",
                    lg: "50%",
                    xl: "40%"
                }}
                maxWidth={{
                    xs: "100%",
                    sm: "500px",
                    md: "400px",
                    lg: "500px"
                }}
                py={{ xs: "1.5rem", sm: "2rem", md: "2rem" }}
                px={{ xs: "1rem", sm: "2rem", md: "2.5rem" }}
                borderRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
                boxShadow={{ xs: 2, sm: 5, md: 8 }}
            >
                <Stack direction="column" spacing={5} width="100%">
                    <Typography
                        level={{ xs: "h5", sm: "h4", md: "h3" }}
                        fontSize={{
                            xs: "1.25rem",
                            sm: "1.5rem",
                            md: "1.75rem"
                        }}
                        textAlign="center"
                    >
                        Reset Password
                    </Typography>
                    <Stack direction="column" spacing={2.5}>
                        <InputWithLabel
                            name="password"
                            value={values.password}
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    password: e.target.value
                                }))
                            }
                            label="New Password"
                            type="password"
                            apiError={error}
                        />
                        <InputWithLabel
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    confirmPassword: e.target.value
                                }))
                            }
                            label="Confirm New Password"
                            type="password"
                        />
                    </Stack>
                    <Button
                        size="lg"
                        onClick={() => changePassword()}
                        disabled={changingPassword}
                        fullWidth
                    >
                        Change password
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}
