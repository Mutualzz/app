import styled from "@emotion/styled";
import { type FC } from "react";

import { CircularProgress } from "@mutualzz/ui/feedback/CircularProgress/CircularProgress";
import { resolveButtonStyles, variantColors } from "./Button.helpers";
import { type ButtonProps, type ButtonSize } from "./Button.types";

const ButtonWrapper = styled.button<ButtonProps>`
    position: relative;
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
    flex-grow: 0;
    flex-shrink: 0;
    width: auto;
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
}>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-size: ${({ size }) =>
        size === "sm" ? "1.2em" : size === "lg" ? "1.5em" : "1.3em"};
    margin-left: ${({ position }) => (position === "end" ? "0.5em" : "0")};
    margin-right: ${({ position }) => (position === "start" ? "0.5em" : "0")};
    flex-shrink: 0;
    flex-grow: 0;
`;

export const Button: FC<ButtonProps> = ({
    variant = "plain",
    color = "primary",
    size = "md",
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
