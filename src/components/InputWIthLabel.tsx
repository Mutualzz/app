import { Input, Stack, Typography, type InputProps } from "@mutualzz/ui-web";

export const InputWithLabel = ({
    label,
    name,
    description,
    apiError,
    ...props
}: {
    name: string;
    description?: string;
    label: string;
    apiError?: string;
} & InputProps) => (
    <Stack
        direction="column"
        spacing={{ xs: 0.125, sm: 0.25, md: 0.5 }}
        width="100%"
    >
        <Stack direction="column">
            <Typography
                fontWeight={500}
                level={{ xs: "body-sm", sm: "body-md" }}
            >
                {label}{" "}
                {props.required && (
                    <Typography variant="plain" color="danger">
                        *
                    </Typography>
                )}
            </Typography>
            {description && (
                <Typography level={{ xs: "body-xs", sm: "body-sm" }}>
                    {description}
                </Typography>
            )}
        </Stack>

        <Input
            textColor="primary"
            showRandom
            size={{ xs: "md", sm: "lg" }}
            {...props}
        />

        {apiError && (
            <Typography variant="plain" color="danger" level="body-sm">
                {apiError}
            </Typography>
        )}
    </Stack>
);
