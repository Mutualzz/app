import { useAppStore } from "@hooks/useAppStore";

import type { APIUser, HttpException } from "@mutualzz/types";
import {
    Button,
    Input,
    Paper,
    Stack,
    Typography,
    type InputProps,
} from "@mutualzz/ui";
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
    <Stack direction="column" spacing={5} width="100%">
        <Typography fontWeight={500} level="body-md">
            {label}{" "}
            {props.required && (
                <Typography css={{ color: "red" }}>*</Typography>
            )}
        </Typography>
        <Input size="lg" {...props} />
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
    const { rest } = app;
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (values: any) => {
            const requestBody: Record<string, string | undefined> = {
                password: values.password,
            };

            if (emailRegex.test(values.usernameOrEmail))
                requestBody.email = values.usernameOrEmail;
            else requestBody.username = values.usernameOrEmail;

            const response = await rest.post<any, APIUser & { token: string }>(
                "auth/login",
                requestBody,
            );

            return response;
        },
        onSuccess: ({ token, ...user }) => {
            app.setToken(token);
            app.setUser(user);
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

    if (app.token) {
        navigate({ to: "/", replace: true });
        return <></>;
    }

    return (
        <Stack
            direction="column"
            height="100vh"
            justifyContent="center"
            alignItems="center"
        >
            <LoginForm
                direction="column"
                justifyContent="center"
                alignItems="center"
                width="100%"
                maxWidth="500px"
                py="2rem"
                px="2rem"
                borderRadius={7.6}
                spacing="1rem"
                boxShadow={5}
                initial={{ opacity: 0, y: -200 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Typography level="h4">Login to an account</Typography>
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
                    <Stack direction="column" spacing={20} width="100%">
                        <form.Field
                            name="usernameOrEmail"
                            children={(field) => (
                                <InputWithLabel
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
                                <Button type="submit" size="lg">
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
                    level="body-sm"
                >
                    Don&apos;t have an account?{" "}
                    <Typography
                        color="info"
                        textDecoration="underline"
                        variant="plain"
                        level="body-sm"
                    >
                        Register
                    </Typography>
                </Typography>
            </LoginForm>
        </Stack>
    );
}
