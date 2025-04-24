import styled from "@emotion/styled";
import { type FC } from "react";

import { CircularProgress } from "@ui/feedback/CircularProgress/CircularProgress";
import {
    ButtonDefaults,
    resolveButtonStyles,
    variantColors,
} from "./Button.helpers";
import { type ButtonProps, type ButtonSize } from "./Button.types";

const { defaultSize, defaultColor, defaultVariant } = ButtonDefaults;

const ButtonWrapper = styled.button<ButtonProps>`
    display: ${({ fullWidth }) => (fullWidth ? "flex" : "inline-flex")};
    align-items: center;
    justify-content: center;
    width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};
    align-self: ${({ fullWidth }) => (fullWidth ? "stretch" : "auto")};
    box-sizing: border-box;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;

    ${({ disabled }) => disabled && "opacity: 0.5; pointer-events: none;"}
    ${({ size = "md" }) => resolveButtonStyles(size)};
    ${({ theme, color = "primary", variant = "plain" }) =>
        variantColors(theme, color)[variant]};
`;

const ButtonContent = styled.span<{ loading?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    flex-shrink: 1;
    width: 100%;
    height: 100%;
    opacity: ${({ loading }) => (loading ? 0 : 1)};
    box-sizing: border-box;
`;

const SpinnerOverlay = styled.span`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
`;

const IconWrapper = styled.span<{
    position: "start" | "end";
    size?: ButtonSize;
    isIconOnly?: boolean;
}>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-size: ${({ size, isIconOnly }) => {
        if (isIconOnly) {
            return size === "sm" ? "1.4em" : size === "lg" ? "1.8em" : "1.6em"; // Icon-only buttons scale up slightly
        }
        return size === "sm" ? "1.2em" : size === "lg" ? "1.5em" : "1.3em"; // Regular icon beside text
    }};
    margin-left: ${({ position, isIconOnly }) =>
        isIconOnly ? "0" : position === "end" ? "0.5em" : "0"};
    margin-right: ${({ position, isIconOnly }) =>
        isIconOnly ? "0" : position === "start" ? "0.5em" : "0"};
    flex-shrink: 0;
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
    fullWidth = false,
    ...props
}) => (
    <ButtonWrapper
        {...props}
        variant={variant}
        color={color}
        size={size}
        disabled={loading || disabled}
        loading={loading}
        fullWidth={fullWidth}
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

        {startIcon && (
            <IconWrapper position="start" size={size}>
                {startIcon}
            </IconWrapper>
        )}
        <ButtonContent loading={loading}>{children}</ButtonContent>
        {endIcon && (
            <IconWrapper position="end" size={size}>
                {endIcon}
            </IconWrapper>
        )}
    </ButtonWrapper>
);
