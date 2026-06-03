import { keyframes } from "@emotion/react";

export const typingDotAnimation = keyframes`
    0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
    30% { transform: translateY(-3px); opacity: 1; }
`;

export const badgePillAnimation = keyframes`
    0% { clip-path: inset(0 50% 0 50% round 9999px); opacity: 0; }
    100% { clip-path: inset(0 0% 0 0% round 9999px); opacity: 1; }
`;
