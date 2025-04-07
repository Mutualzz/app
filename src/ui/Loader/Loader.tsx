import styled from "@emotion/styled";
import { type LoaderProps } from "./Loader.types";

export const Loader = styled.div<LoaderProps>`
    width: 50px;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 8px solid;
    border-color: ${({ theme }) => theme };
    animation: l1 1s infinite;

    @keyframes l1 {
        to {
            transform: rotate(0.5turn);
        }
    }
`;
