import { css, type Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { type FC } from "react";

import { CircularProgress } from "../CircularProgress/CircularProgress";
import { type ButtonColor, type ButtonProps } from "./Button.types";

const sizeStyles = {
    sm: css`
        padding-inline: 0.75rem;
        padding-block: 0.25rem;
        font-size: 0.875rem;
    `,
    md: css`
        padding-inline: 1rem;
        padding-block: 0.375rem;
        font-size: 1rem;
    `,
    lg: css`
        padding-inline: 1.5rem;
        padding-block: 0.5rem;
        font-size: 1rem;
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
            &:active {
                background-color: ${color}cc;
            }
            &:disabled {
                background-color: ${color}20;
                color: ${color}50;
            }
        `,
        outlined: css`
            background-color: transparent;
            border: 1px solid ${color};
            color: ${color};
            &:hover {
                background-color: ${color}20;
                border: 0.1px solid ${color}20;
            }
            &:active {
                background-color: ${color}20;
            }
            &:disabled {
                color: ${color}50;
                border: 1px solid ${color}50;
            }
        `,
        plain: css`
            background-color: transparent;
            border: none;
            color: ${color};
            &:hover {
                color: ${color}80;
            }
            &:active {
                color: ${color}50;
            }
            &:disabled {
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
            &:active {
                background-color: ${color}20;
            }
            &:disabled {
                background-color: ${color}20;
                color: ${color}50;
            }
        `,
    };
};

const ButtonWrapper = styled.button<ButtonProps>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 6px;
    transition: all 0.3s;
    cursor: pointer;
    user-select: none;
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    margin: 1;

    ${(props) => sizeStyles[props.size ?? "md"]};
    ${(props) =>
        colorStyles(props.theme, props.color ?? "primary")[
            props.variant ?? "plain"
        ]};

    &:disabled {
        pointer-events: none;
    }
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
    ...props
}) => {
    return (
        <ButtonWrapper
            {...props}
            variant={variant}
            color={color}
            size={size}
            disabled={loading || disabled}
            loading={loading ?? false}
        >
            {startIcon && (
                <span style={{ marginRight: "0.5rem" }}>{startIcon}</span>
            )}
            {loading ? (
                <CircularProgress
                    variant={
                        variant === "solid" || variant === "soft"
                            ? "plain"
                            : "soft"
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
};
