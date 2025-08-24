import {
    Input,
    Option,
    Select,
    Stack,
    Typography,
    type InputProps,
} from "@mutualzz/ui";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useEffect, useState } from "react";

interface ApiErrors {
    email?: string;
    globalName?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    dateOfBirth?: string;
}

const MONTHS = [
    {
        value: "01",
        name: "January",
    },
    {
        value: "02",
        name: "February",
    },
    {
        value: "03",
        name: "March",
    },
    {
        value: "04",
        name: "April",
    },
    {
        value: "05",
        name: "May",
    },
    {
        value: "06",
        name: "June",
    },
    {
        value: "07",
        name: "July",
    },
    {
        value: "08",
        name: "August",
    },
    {
        value: "09",
        name: "September",
    },
    {
        value: "10",
        name: "October",
    },
    {
        value: "11",
        name: "November",
    },
    {
        value: "12",
        name: "December",
    },
];

export const DOBInput = ({
    apiErrors,
    field,
    label,
    ...props
}: InputProps & {
    field: AnyFieldApi;
    label: string;
    apiErrors: ApiErrors;
}) => {
    const [dob, setDob] = useState({
        month: "",
        day: "",
        year: "",
    });

    useEffect(() => {
        const formattedDob = `${dob.year}-${dob.month}-${dob.day}`;
        field.handleChange(formattedDob);
    }, [dob]);

    const handleMonth = (month: any) => {
        setDob((prev) => ({ ...prev, month: month }));
    };

    const handleDay = (e: any) => {
        setDob((prev) => ({ ...prev, day: e.target.value }));
    };

    const handleYear = (e: any) => {
        setDob((prev) => ({ ...prev, year: e.target.value }));
    };

    return (
        <Stack
            direction="column"
            spacing={{ xs: 2, sm: 3, md: 4 }}
            width="100%"
        >
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
            <Stack spacing={12} direction="row" width="100%">
                <Select
                    color="neutral"
                    variant="outlined"
                    placeholder="Select month"
                    onValueChange={handleMonth}
                    size={{ xs: "sm", sm: "md" }}
                >
                    {MONTHS.map((month) => (
                        <Option key={month.value} value={month.value}>
                            {month.name}
                        </Option>
                    ))}
                </Select>
                <Input
                    type="number"
                    size={{ xs: "md", sm: "lg" }}
                    placeholder="Day"
                    min={1}
                    max={31}
                    onChange={handleDay}
                    fullWidth
                />
                <Input
                    fullWidth
                    type="number"
                    size={{ xs: "sm", sm: "md" }}
                    placeholder="Year"
                    onChange={handleYear}
                    min={1900}
                    max={2100}
                />
            </Stack>
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
};
