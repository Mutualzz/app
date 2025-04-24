import { keyframes } from "@emotion/react";

export const slide = keyframes`
    0% { left: -50%; }
    50% { left: 25%; }
    100% { left: 100%; }
`;

export const wave = keyframes`
    0% { transform: translateX(-100%) scaleX(0.8); opacity: 0.5; }
    50% { transform: translateX(50%) scaleX(1); opacity: 1; }
    100% { transform: translateX(100%) scaleX(0.8); opacity: 0.5; }
`;

export const bounce = keyframes`
    0%, 100% { left: 0; width: 30%; }
    50% { left: 70%; width: 30%; }
`;

export const scaleInOut = keyframes`
    0%, 100% { transform: scaleX(0.5); opacity: 0.5; }
    50% { transform: scaleX(1); opacity: 1; }
`;
