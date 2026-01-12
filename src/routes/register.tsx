import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { DOBInput } from "@components/DOBInput";
import { useAppStore } from "@hooks/useStores";
import type { HttpException } from "@mutualzz/types";
import {
    Button,
    Input,
    type InputProps,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import { validateRegister } from "@mutualzz/validators";
import { seo } from "@seo";
import {
    type AnyFieldApi,
    revalidateLogic,
    useForm,
} from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
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
    <Stack
        direction="column"
        spacing={{ xs: 0.5, sm: 0.75, md: 1 }}
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
            size={{ xs: "md", sm: "lg" }}
            {...props}
            autoCapitalize="off"
            autoComplete="off"
        />
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

function Register() {
    const navigate = useNavigate();
    const app = useAppStore();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [apiErrors, setApiErrors] = useState<ApiErrors>({});

    const { mutate: register, isPending } = useMutation({
        mutationFn: async (values: any) =>
            app.rest.post<any, { token: string }>("auth/register", values),
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

    const Form = useForm({
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
            register(value);
        },
    });

    if (app.token) {
        navigate({ to: "/", replace: true });
        return <></>;
    }

    return (
        <Stack
            width="100%"
            minHeight="100%"
            justifyContent="center"
            alignItems="center"
            px={{ xs: "0.5rem", sm: "1.5rem", md: "2.5rem" }}
            py={{ xs: "1rem", sm: "2rem", md: "3rem" }}
        >
            <AnimatedPaper
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
                <Typography
                    level={{ xs: "h5", sm: "h4" }}
                    fontSize={{ xs: "1.25rem", sm: "1.5rem", md: "2rem" }}
                    textAlign="center"
                >
                    Create an account
                </Typography>
                <form
                    css={{
                        width: "100%",
                    }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        Form.handleSubmit();
                    }}
                >
                    <Stack direction="column" spacing={3} width="100%">
                        <Form.Field
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

                        <Form.Field
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
                        <Form.Field
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
                        <Form.Field
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
                        <Form.Field
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
                        <Form.Field
                            name="dateOfBirth"
                            children={(field) => (
                                <DOBInput
                                    apiErrors={apiErrors}
                                    field={field}
                                    name="dateOfBirth"
                                    label="Date Of Birth"
                                    value={field.state.value}
                                    type="date"
                                    required
                                />
                            )}
                        />
                        <Form.Subscribe
                            selector={(state) => [state.isSubmitting]}
                            children={([isSubmitting]) => (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isPending}
                                    size={{ xs: "md", sm: "lg" }}
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
                    level={{ xs: "body-sm", sm: "body-md" }}
                    fontSize={{ xs: "0.95rem", sm: "1.1rem" }}
                    textAlign="center"
                >
                    Already have an account?{" "}
                    <Typography
                        color="info"
                        textDecoration="underline"
                        variant="plain"
                        level={{ xs: "body-sm", sm: "body-md" }}
                    >
                        Login
                    </Typography>
                </Typography>
            </AnimatedPaper>
        </Stack>
    );
}
