import styled from "@emotion/styled";
import { type FC } from "react";

import { CircularProgress } from "@ui/feedback/CircularProgress/CircularProgress";
import {
    ButtonDefaults,
    resolveButtonStyles,
    variantColors,
} from "./Button.helpers";
import { type ButtonProps } from "./Button.types";

const { defaultSize, defaultColor, defaultVariant } = ButtonDefaults;

const ButtonWrapper = styled.button<ButtonProps>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 6px;
    transition: all 0.3s;
    cursor: pointer;
    user-select: none;
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
    padding: 0 1.25rem;
    ${({ size = "md" }) => resolveButtonStyles(size)};

    ${({ theme, color = "primary", variant = "plain" }) =>
        variantColors(theme, color)[variant]};

    &:disabled {
        pointer-events: none;
    }

    & > span {
        display: inline-flex;
        align-items: center;
    }
`;

export const Button: FC<ButtonProps> = ({
    variant = defaultVariant,
    color = defaultColor,
    size = defaultSize,
    loading,
    startIcon,
    endIcon,
    disabled,
    children,
    ...props
}) => (
    <ButtonWrapper
        {...props}
        variant={variant}
        color={color}
        size={size}
        disabled={loading || disabled}
        loading={loading}
    >
        {startIcon && (
            <span style={{ marginRight: "0.5rem" }}>{startIcon}</span>
        )}
        {loading ? (
            <CircularProgress
                variant={
                    variant === "solid" || variant === "soft" ? "plain" : "soft"
                }
                color={color}
                size={size}
            />
        ) : (
            children
        )}
        {endIcon && <span style={{ marginLeft: "0.5rem" }}>{endIcon}</span>}
    </ButtonWrapper>
);
