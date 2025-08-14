import { useAppStore } from "@hooks/useStores";
import type { HttpException } from "@mutualzz/types";
import {
    Button,
    Input,
    Paper,
    Stack,
    Typography,
    type InputProps,
} from "@mutualzz/ui";
import { validateRegister } from "@mutualzz/validators";
import { seo } from "@seo";
import {
    revalidateLogic,
    useForm,
    type AnyFieldApi,
} from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { motion } from "motion/react";
import { useState } from "react";

export const Route = createFileRoute("/register")({
    component: observer(Register),
    head: () => ({
        meta: [
            ...seo({
                title: "Mutualzz - Register",
            }),
        ],
    }),
});

interface ApiErrors {
    email?: string;
    globalName?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    dateOfBirth?: string;
}

const InputWithLabel = ({
    apiErrors,
    field,
    label,
    ...props
}: InputProps & {
    field: AnyFieldApi;
    label: string;
    apiErrors: ApiErrors;
}) => (
    <Stack direction="column" spacing={5} width="100%">
        <Typography fontWeight={500} level="body-md">
            {label}{" "}
            {props.required && (
                <Typography variant="plain" color="danger">
                    *
                </Typography>
            )}
        </Typography>
        <Input size="lg" {...props} />
        {!field.state.meta.isValid && field.state.meta.isTouched && (
            <Typography variant="plain" color="danger" level="body-sm">
                {field.state.meta.errors[0].message}
            </Typography>
        )}
        {apiErrors[field.name as keyof ApiErrors] && (
            <Typography variant="plain" color="danger" level="body-sm">
                {apiErrors[field.name as keyof ApiErrors]}
            </Typography>
        )}
    </Stack>
);

const RegisterForm = motion.create(Paper);

function Register() {
    const navigate = useNavigate();
    const app = useAppStore();
    const { account, rest } = app;
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [apiErrors, setApiErrors] = useState<ApiErrors>({});

    const mutation = useMutation({
        mutationFn: async (values: any) => {
            const response = await rest.post<any, { token: string }>(
                "auth/register",
                values,
            );

            return response;
        },
        onSuccess: ({ token }) => {
            app.setToken(token);
        },
        onError: (error: HttpException) => {
            error.errors.forEach((err) => {
                setApiErrors({
                    [err.path]: err.message,
                });
            });
        },
    });

    const form = useForm({
        defaultValues: {
            email: "",
            globalName: undefined as string | undefined,
            username: "",
            password: "",
            confirmPassword: "",
            dateOfBirth: "",
        },
        validationLogic: revalidateLogic(),
        validators: {
            onDynamic: validateRegister as any, // TypeScript workaround for dynamic validation
        },
        onSubmit: ({ value }) => {
            mutation.mutate(value);
        },
    });

    if (account) {
        navigate({ to: "/", replace: true });
        return <></>;
    }

    return (
        <Stack height="100vh" justifyContent="center" alignItems="center">
            <RegisterForm
                direction="column"
                justifyContent="center"
                alignItems="center"
                width="100%"
                maxWidth="550px"
                py="2rem"
                px="2rem"
                borderRadius={7.6}
                spacing="1rem"
                boxShadow={5}
                initial={{ opacity: 0, y: -200 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Typography level="h4">Create an account</Typography>
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
                            name="email"
                            children={(field) => (
                                <InputWithLabel
                                    type="text"
                                    apiErrors={apiErrors}
                                    field={field}
                                    name="email"
                                    label="Email"
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
                            name="globalName"
                            children={(field) => (
                                <InputWithLabel
                                    type="text"
                                    apiErrors={apiErrors}
                                    field={field}
                                    name="globalName"
                                    label="Display Name"
                                    onChange={(e) =>
                                        field.handleChange(
                                            e.target.value.length > 0
                                                ? e.target.value
                                                : undefined,
                                        )
                                    }
                                    onBlur={field.handleBlur}
                                    value={field.state.value ?? ""}
                                />
                            )}
                        />
                        <form.Field
                            name="username"
                            children={(field) => (
                                <InputWithLabel
                                    type="text"
                                    apiErrors={apiErrors}
                                    field={field}
                                    name="username"
                                    label="Username"
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
                                    apiErrors={apiErrors}
                                    field={field}
                                    name="password"
                                    label="Password"
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    value={field.state.value}
                                    type="password"
                                    visible={passwordVisible}
                                    onTogglePassword={() =>
                                        setPasswordVisible((prev) => !prev)
                                    }
                                    required
                                />
                            )}
                        />
                        <form.Field
                            name="confirmPassword"
                            children={(field) => (
                                <InputWithLabel
                                    apiErrors={apiErrors}
                                    field={field}
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    value={field.state.value}
                                    type="password"
                                    visible={passwordVisible}
                                    onTogglePassword={() =>
                                        setPasswordVisible((prev) => !prev)
                                    }
                                    required
                                />
                            )}
                        />
                        <form.Field
                            name="dateOfBirth"
                            children={(field) => (
                                <InputWithLabel
                                    apiErrors={apiErrors}
                                    field={field}
                                    name="dateOfBirth"
                                    label="Date Of Birth"
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    value={field.state.value}
                                    type="date"
                                    required
                                />
                            )}
                        />
                        <form.Subscribe
                            selector={(state) => [
                                state.canSubmit,
                                state.isSubmitting,
                            ]}
                            children={([canSubmit, isSubmitting]) => (
                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    size="lg"
                                >
                                    {isSubmitting ? "..." : "Create Account"}
                                </Button>
                            )}
                        />
                    </Stack>
                </form>
                <Typography
                    onClick={() => {
                        navigate({ to: "/login" });
                    }}
                    css={{
                        cursor: "pointer",
                    }}
                    level="body-sm"
                >
                    Already have an account?{" "}
                    <Typography
                        color="info"
                        textDecoration="underline"
                        variant="plain"
                        level="body-sm"
                    >
                        Login
                    </Typography>
                </Typography>
            </RegisterForm>
        </Stack>
    );
}
