import {
  Input,
  Option,
  Select,
  Stack,
  Typography,
  type InputProps
} from "@mutualzz/ui-web";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ApiErrors {
  email?: string;
  globalName?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  dateOfBirth?: string;
}

const MONTH_VALUES = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12"
] as const;

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
  const { t } = useTranslation("auth");
  const [dob, setDob] = useState({
    month: "",
    day: "",
    year: ""
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
      <Stack spacing={3} direction="row" width="100%">
        <Select
          color="neutral"
          variant="outlined"
          placeholder={t("dob.selectMonth")}
          onValueChange={handleMonth}
          size={{ xs: "sm", sm: "md" }}
        >
          {MONTH_VALUES.map((value) => (
            <Option key={value} value={value}>
              {t(`dob.months.${value}`)}
            </Option>
          ))}
        </Select>
        <Input
          type="number"
          size={{ xs: "md", sm: "lg" }}
          placeholder={t("dob.day")}
          min={1}
          max={31}
          onChange={handleDay}
          fullWidth
        />
        <Input
          fullWidth
          type="number"
          size={{ xs: "sm", sm: "md" }}
          placeholder={t("dob.year")}
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
