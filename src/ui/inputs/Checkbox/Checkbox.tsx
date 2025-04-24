import styled from "@emotion/styled";
import { useTheme } from "@hooks/useTheme";
import { useState, type ChangeEvent, type FC } from "react";
import {
    resolveCheckboxStyles,
    resolveIconScaling,
    variantColors,
} from "./Checkbox.helpers";
import { type CheckboxProps, type CheckboxSize } from "./Checkbox.types";

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

const IconWrapper = styled.span<{ size?: CheckboxSize }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    ${({ size = "md" }) => resolveIconScaling(size)};

    & > * {
        width: 100%;
        height: 100%;
    }
`;

export const Checkbox: FC<CheckboxProps> = ({
    checked: controlledChecked,
    onChange,
    label,
    disabled,
    color = "primary",
    variant = "plain",
    size = "md",
    uncheckedIcon,
    checkedIcon,
    indeterminate,
    indeterminateIcon,
    ...props
}) => {
    const { theme } = useTheme();

    const [internalChecked, setInternalChecked] = useState(false);
    const isChecked =
        controlledChecked !== undefined ? controlledChecked : internalChecked;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (controlledChecked === undefined) {
            setInternalChecked(e.target.checked);
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
                ref={(el) => {
                    if (el) {
                        el.indeterminate = indeterminate ?? false;
                    }
                }}
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
                {indeterminate ? (
                    indeterminateIcon ? (
                        <IconWrapper size={size}>
                            {indeterminateIcon}
                        </IconWrapper>
                    ) : (
                        // Default indeterminate SVG
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ width: "60%", height: "60%" }}
                        >
                            <line x1="6" y1="12" x2="18" y2="12" />
                        </svg>
                    )
                ) : isChecked ? (
                    checkedIcon ? (
                        <IconWrapper size={size}>{checkedIcon}</IconWrapper>
                    ) : (
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
                    )
                ) : uncheckedIcon ? (
                    <IconWrapper size={size}>{uncheckedIcon}</IconWrapper>
                ) : null}
            </CheckboxBox>
            {label && <CheckboxLabel>{label}</CheckboxLabel>}
        </CheckboxWrapper>
    );
};
