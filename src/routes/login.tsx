import { SpaceIcon } from "@components/Space/SpaceIcon.tsx";
import { useAppStore } from "@hooks/useStores";
import type { HttpException } from "@mutualzz/types";
import {
    Button,
    Input,
    type InputProps,
    Paper,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import { emailRegex } from "@mutualzz/validators";
import { seo } from "@seo";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { motion } from "motion/react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
    component: observer(Login),
    head: () => ({
        meta: [
            ...seo({
                title: "Mutualzz - Login",
            }),
        ],
    }),
});

const InputWithLabel = ({
    label,
    apiError,
    ...props
}: InputProps & {
    label: string;
    apiError?: string | null;
}) => (
    <Stack
        direction="column"
        spacing={{ xs: 0.5, sm: 0.75, md: 0.875 }}
        width="100%"
    >
        <Typography fontWeight={500} level={{ xs: "body-sm", sm: "body-md" }}>
            {label}{" "}
            {props.required && (
                <Typography variant="plain" color="danger">
                    *
                </Typography>
            )}
        </Typography>
        <Input
            fullWidth
            size={{ xs: "md", sm: "lg", md: "lg" }}
            {...props}
            autoComplete="off"
            autoCapitalize="off"
        />
        {apiError && (
            <Typography variant="plain" color="danger" level="body-sm">
                {apiError}
            </Typography>
        )}
    </Stack>
);

const LoginForm = motion.create(Paper);

function Login() {
    const navigate = useNavigate();
    const app = useAppStore();
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (values: any) => {
            const requestBody: Record<string, string | undefined> = {
                password: values.password,
            };

            if (emailRegex.test(values.usernameOrEmail))
                requestBody.email = values.usernameOrEmail;
            else requestBody.username = values.usernameOrEmail;

            return app.rest.post<{ token: string }, any>(
                "auth/login",
                requestBody,
            );
        },
        onSuccess: ({ token }) => {
            app.setToken(token);
        },
        onError: (error: HttpException) => {
            setError(error.message);
        },
    });

    const form = useForm({
        defaultValues: {
            usernameOrEmail: "",
            password: "",
        },
        onSubmit: ({ value }) => {
            mutation.mutate(value);
        },
    });

    if (app.account) {
        navigate({ to: "/", replace: true });
        return <></>;
    }

    const space = app.joiningSpace;

    return (
        <Stack
            direction="column"
            width="100%"
            minHeight="100%"
            justifyContent="center"
            alignItems="center"
            px={{ xs: "0.5rem", sm: "1.5rem", md: "2.5rem" }}
            py={{ xs: "1rem", sm: "2rem", md: "3rem" }}
        >
            <LoginForm
                direction="column"
                justifyContent="center"
                alignItems="center"
                width={{
                    xs: "100%",
                    sm: "90%",
                    md: "70%",
                    lg: "50%",
                    xl: "40%",
                }}
                maxWidth={{
                    xs: "100%",
                    sm: "500px",
                    md: "520px",
                    lg: "600px",
                }}
                py={{ xs: "1.5rem", sm: "2rem", md: "2.5rem" }}
                px={{ xs: "1rem", sm: "2rem", md: "2.5rem" }}
                borderRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
                spacing={{ xs: "1rem", sm: "1.5rem", md: "2rem" }}
                boxShadow={{ xs: 2, sm: 5, md: 8 }}
                initial={{ opacity: 0, y: -200 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Stack direction="column" spacing={1.5} width="100%">
                    <Typography
                        level={{ xs: "h5", sm: "h4", md: "h3" }}
                        fontSize={{
                            xs: "1.25rem",
                            sm: "1.5rem",
                            md: "1.75rem",
                        }}
                        textAlign="center"
                    >
                        Login to an account
                    </Typography>
                    {space && (
                        <Stack
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                            spacing={3}
                        >
                            <Typography
                                level="body-sm"
                                color="primary"
                                textAlign="center"
                            >
                                You are logging in to accept an invite to join a
                                space:{" "}
                            </Typography>
                            <Stack alignItems="center" spacing={1}>
                                <SpaceIcon size={36} space={space} />
                                <Typography level="body-sm" textAlign="center">
                                    {space.name}
                                </Typography>
                            </Stack>
                        </Stack>
                    )}
                </Stack>
                <form
                    css={{
                        width: "100%",
                    }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <Stack direction="column" spacing={3} width="100%">
                        <form.Field
                            name="usernameOrEmail"
                            children={(field) => (
                                <InputWithLabel
                                    type="text"
                                    label="Username or Email"
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    value={field.state.value}
                                    required
                                />
                            )}
                        />
                        <form.Field
                            name="password"
                            children={(field) => (
                                <InputWithLabel
                                    label="Password"
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    value={field.state.value}
                                    apiError={error}
                                    type="password"
                                    required
                                />
                            )}
                        />
                        <form.Subscribe
                            selector={(state) => [state.isSubmitting]}
                            children={([isSubmitting]) => (
                                <Button
                                    type="submit"
                                    size={{ xs: "md", sm: "lg", md: "lg" }}
                                >
                                    {isSubmitting ? "..." : "Login"}
                                </Button>
                            )}
                        />
                    </Stack>
                </form>
                <Typography
                    onClick={() => {
                        navigate({ to: "/register" });
                    }}
                    css={{
                        cursor: "pointer",
                    }}
                    level={{ xs: "body-sm", sm: "body-md", md: "body-lg" }}
                    fontSize={{ xs: "0.95rem", sm: "1.1rem", md: "1.2rem" }}
                    textAlign="center"
                >
                    Don&apos;t have an account?{" "}
                    <Typography
                        color="info"
                        textDecoration="underline"
                        variant="plain"
                        level={{ xs: "body-sm", sm: "body-md", md: "body-lg" }}
                        fontSize={{ xs: "0.95rem", sm: "1.1rem", md: "1.2rem" }}
                    >
                        Register
                    </Typography>
                </Typography>
            </LoginForm>
        </Stack>
    );
}
