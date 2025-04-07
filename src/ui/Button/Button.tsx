import React from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useTheme } from "../../contexts/ThemeManager";
import { Theme } from "@emotion/react";

export type ButtonColor =
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "info";

export type ButtonVariant = "contained" | "outlined" | "text" | "subtle";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    loading?: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const sizeStyles = {
    xs: css`
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
    `,
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
    xl: css`
        padding: 1rem 2rem;
        font-size: 1.25rem;
    `,
};

const variantStyles = ({ colors }: Theme, buttonColor: ButtonColor) => ({
    contained: css`
        background-color: ${colors[buttonColor]};
        color: ${buttonColor === "warning"
            ? colors.typography.accent
            : colors.typography.primary};
        border: none;
        &:hover {
            background-color: ${colors[buttonColor]}aa;
        }
        &:active {
            background-color: ${colors[buttonColor]}cc;
        }
    `,
    outlined: css`
        background-color: transparent;
        border: 1px solid ${colors[buttonColor]};
        color: ${colors[buttonColor]};
        &:hover {
            color: ${colors[buttonColor]}80;
        }
        &:active {
            background-color: ${colors[buttonColor]}20;
        }
    `,
    text: css`
        background-color: transparent;
        border: none;
        color: ${colors[buttonColor]};
        &:hover {
            background-color: ${colors[buttonColor]}10;
            color: ${colors.typography.primary};
        }
        &:active {
            background-color: ${colors[buttonColor]}20;
            color: ${colors.typography.primary};
        }
    `,
    subtle: css`
        background-color: ${colors[buttonColor]}50;
        color: ${colors[buttonColor]};
        border: none;
        &:hover {
            background-color: ${colors[buttonColor]}15;
        }
        &:active {
            background-color: ${colors[buttonColor]}20;
        }
    `,
});

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
        cursor: not-allowed;
    }
`;

export const Button: React.FC<ButtonProps> = ({
    variant = "contained",
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
        ${variantStyles(theme, color)[variant]}
    `;
    console.log("variantStyle", variantStyle);

    return (
        <ButtonWrapper
            variant={variant}
            color={color}
            size={size}
            fullWidth={fullWidth}
            disabled={loading || disabled}
            css={variantStyle}
            {...props}
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
