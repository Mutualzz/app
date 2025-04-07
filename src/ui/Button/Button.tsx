import { css, type Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { type FC } from "react";
import { useTheme } from "../../contexts/ThemeManager";
import { sizeStyles } from "../../utils";
import { Loader } from "../Loader/Loader";
import { type ButtonColor, type ButtonProps } from "./Button.types";

const colorStyles = ({ colors }: Theme, buttonColor: ButtonColor) => ({
    contained: css`
        background-color: ${colors[buttonColor]};
        color: ${buttonColor === "warning"
            ? colors.typography.accent
            : colors.typography.primary};
        border: none;
        &:hover {
            background-color: ${colors[buttonColor]}aa;
        }
        &:focus {
            outline: none;
            box-shadow: 0 0 0 4px ${colors[buttonColor]}aa;
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
        &:focus {
            outline: none;
            box-shadow: 0 0 0 4px ${colors[buttonColor]}aa;
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
            color: ${colors[buttonColor]}80;
        }
        &:focus {
            outline: none;
            box-shadow: 0 0 0 4px ${colors[buttonColor]}aa;
        }
        &:active {
            color: ${colors[buttonColor]}50;
        }
    `,
    subtle: css`
        background-color: ${colors[buttonColor]}50;
        color: ${colors[buttonColor]};
        border: none;
        &:hover {
            background-color: ${colors[buttonColor]}30;
        }
        &:focus {
            outline: none;
            box-shadow: 0 0 0 4px ${colors[buttonColor]}aa;
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
        cursor: ${(props) => (props.loading ? "wait" : "not-allowed")};
    }
`;

export const Button: FC<ButtonProps> = ({
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

    return (
        <ButtonWrapper
            variant={variant}
            color={color}
            size={size}
            fullWidth={fullWidth}
            disabled={loading || disabled}
            loading={loading}
            css={variantStyle}
            {...props}
        >
            {leftIcon && (
                <span style={{ marginRight: "0.5rem" }}>{leftIcon}</span>
            )}
            {loading ? <Loader /> : children}
            {rightIcon && (
                <span style={{ marginLeft: "0.5rem" }}>{rightIcon}</span>
            )}
        </ButtonWrapper>
    );
};
