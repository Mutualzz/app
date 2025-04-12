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
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 6px;
    transition: all 0.3s;
    cursor: pointer;
    user-select: none;
    overflow: hidden;
    padding: 0 1.25rem;

    ${({ disabled }) => disabled && `opacity: 0.5; pointer-events: none;`}
    ${({ size = "md" }) => resolveButtonStyles(size)};
    ${({ theme, color = "primary", variant = "plain" }) =>
        variantColors(theme, color)[variant]};
`;

const ButtonContent = styled.span<{ loading?: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    visibility: ${({ loading }) => (loading ? "hidden" : "visible")};
`;

const SpinnerOverlay = styled.span`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
`;

const IconWrapper = styled.span<{ position: "start" | "end" }>`
    display: inline-flex;
    align-items: center;
    margin-left: ${({ position }) => (position === "end" ? "0.5rem" : "0")};
    margin-right: ${({ position }) => (position === "start" ? "0.5rem" : "0")};
`;

// TODO: Add a support for custom text colors on the custom button, so when a user adds a custom button color they have a chance to have a custom text so it aligns with their needs
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
        {loading && (
            <SpinnerOverlay>
                <CircularProgress
                    variant={
                        variant === "solid" || variant === "soft"
                            ? "plain"
                            : "soft"
                    }
                    color={color}
                    size="sm"
                />
            </SpinnerOverlay>
        )}

        <ButtonContent loading={loading}>
            {startIcon && (
                <IconWrapper position="start">{startIcon}</IconWrapper>
            )}
            {children}
            {endIcon && <IconWrapper position="end">{endIcon}</IconWrapper>}
        </ButtonContent>
    </ButtonWrapper>
);
