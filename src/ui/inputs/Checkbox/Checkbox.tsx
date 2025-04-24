import styled from "@emotion/styled";
import { useTheme } from "@hooks/useTheme";
import { useState, type ChangeEvent, type FC } from "react";
import { resolveCheckboxStyles, variantColors } from "./Checkbox.helpers";
import { type CheckboxProps } from "./Checkbox.types";

const CheckboxWrapper = styled.label<CheckboxProps>`
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    transition: all 0.3s ease;

    ${({ disabled }) => disabled && "opacity: 0.5; pointer-events: none;"}
    ${({ size = "md" }) => resolveCheckboxStyles(size)};
`;

const HiddenCheckbox = styled.input`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: pointer;
    opacity: 0;
`;

const CheckboxBox = styled.span<CheckboxProps>`
    position: relative;
    border-radius: 4px;
    width: 1em;
    height: 1em;
    border: 1px solid currentColor;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    ${({ theme, color = "primary", variant = "plain", checked }) =>
        variantColors(theme, color, checked)[variant]}
`;

const CheckboxLabel = styled.span`
    margin-left: 0.5rem;
`;

export const Checkbox: FC<CheckboxProps> = ({
    checked: controlledChecked,
    onChange,
    label,
    disabled,
    color = "primary",
    variant = "plain",
    size = "md",
    ...props
}) => {
    const { theme } = useTheme();

    const [internalChecked, setInternalChecked] = useState(false);
    const isChecked =
        controlledChecked !== undefined ? controlledChecked : internalChecked;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (controlledChecked === undefined) {
            setInternalChecked(e.target.checked); // ✅ this was flipped!
        }
        onChange?.(e);
    };

    return (
        <CheckboxWrapper as="label" disabled={disabled} size={size}>
            <HiddenCheckbox
                type="checkbox"
                checked={isChecked}
                onChange={handleChange}
                disabled={disabled}
            />
            <CheckboxBox
                theme={theme}
                role="checkbox"
                aria-checked={isChecked}
                color={color}
                variant={variant}
                checked={isChecked}
                disabled={disabled}
                size={size}
                {...props}
            >
                {isChecked && (
                    <svg
                        viewBox="2 2 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        width="60%"
                        height="60%"
                    >
                        <polyline points="4 12 10 18 20 6" />
                    </svg>
                )}
            </CheckboxBox>
            {label && <CheckboxLabel>{label}</CheckboxLabel>}
        </CheckboxWrapper>
    );
};
