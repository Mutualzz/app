import {
    Button,
    Input,
    Paper,
    Stack,
    Typography,
    type InputProps,
} from "@mutualzz/ui";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/register")({
    component: Register,
});

const InputWithLabel = ({
    label,
    ...props
}: InputProps & { label: string }) => {
    return (
        <Stack direction="column" spacing={5} width="100%">
            <Typography fontWeight={500} level="body-md">
                {label}{" "}
                {props.required && (
                    <Typography css={{ color: "red" }}>*</Typography>
                )}
            </Typography>
            <Input size="lg" {...props} />
        </Stack>
    );
};

function Register() {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const form = useForm({
        defaultValues: {
            email: "",
            globalName: "",
            username: "",
            password: "",
            confirmPassword: "",
            dateOfBirth: "",
        },
    });

    console.log(passwordVisible);

    return (
        <Stack height="100vh" justifyContent="center" alignItems="center">
            <Paper
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
            >
                <Typography level="h3">Create an account</Typography>
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
                                    label="Global Name"
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    value={field.state.value}
                                />
                            )}
                        />
                        <form.Field
                            name="username"
                            children={(field) => (
                                <InputWithLabel
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
            </Paper>
        </Stack>
    );
}
