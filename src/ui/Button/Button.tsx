import { css, type Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { type FC } from "react";
import { useTheme } from "../../contexts/ThemeManager";

import { type ButtonColor, type ButtonProps } from "./Button.types";

const sizeStyles = {
    sm: css`
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
    `,
    md: css`
        padding: 0.5rem 1rem;
        font-size: 1rem;
    `,
    lg: css`
        padding: 0.75rem 1.5rem;
        font-size: 1.125rem;
    `,
};

const colorStyles = ({ colors }: Theme, buttonColor: ButtonColor) => {
    // Color to use for the buttons
    const color = colors[buttonColor].hex();

    return {
        solid: css`
            background-color: ${color};
            color: ${color === "warning"
                ? colors.typography.primary.negate().hex()
                : colors.typography.primary.hex()};
            border: none;
            &:hover {
                background-color: ${color}aa;
            }
            &:focus {
                outline: none;
                box-shadow: 0 0 0 4px ${color}aa;
            }
            &:active {
                background-color: ${color}cc;
            }
        `,
        outlined: css`
            background-color: transparent;
            border: 1px solid ${color};
            color: ${color};
            &:hover {
                color: ${color}80;
            }
            &:focus {
                outline: none;
                box-shadow: 0 0 0 4px ${color}aa;
            }
            &:active {
                background-color: ${color}20;
            }
        `,
        plain: css`
            background-color: transparent;
            border: none;
            color: ${color};
            &:hover {
                color: ${color}80;
            }
            &:focus {
                outline: none;
                box-shadow: 0 0 0 4px ${color}aa;
            }
            &:active {
                color: ${color}50;
            }
        `,
        soft: css`
            background-color: ${color}50;
            color: ${color};
            border: none;
            &:hover {
                background-color: ${color}30;
            }
            &:focus {
                outline: none;
                box-shadow: 0 0 0 4px ${color}aa;
            }
            &:active {
                background-color: ${color}20;
            }
        `,
    };
};

const ButtonWrapper = styled.button<ButtonProps>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    border-radius: 12px;
    transition: all 0.3s;
    cursor: pointer;
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    width: ${(props) => (props.fullWidth ? "100%" : "auto")};

    ${(props) => sizeStyles[props.size || "md"]};

    &:disabled {
        pointer-events: none;
    }
`;

export const Button: FC<ButtonProps> = ({
    variant = "solid",
    color = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled = false,
    children,
    ...props
}) => {
    const { theme } = useTheme();

    const variantStyle = css`
        ${colorStyles(theme, color)[variant]}
    `;

    return (
        <ButtonWrapper
            {...props}
            variant={variant}
            color={color}
            size={size}
            fullWidth={fullWidth}
            disabled={loading || disabled}
            loading={loading}
            css={variantStyle}
        >
            {leftIcon && (
                <span style={{ marginRight: "0.5rem" }}>{leftIcon}</span>
            )}

            {children}
            {rightIcon && (
                <span style={{ marginLeft: "0.5rem" }}>{rightIcon}</span>
            )}
        </ButtonWrapper>
    );
};
