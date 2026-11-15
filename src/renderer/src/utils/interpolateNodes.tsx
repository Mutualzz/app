import { Fragment, type ReactNode } from "react";

export const nameToken = (index: number) => `\u2063${index}\u2063`;

const TOKEN_PATTERN = /\u2063(\d+)\u2063/;

export const interpolateNodes = (template: string, nodes: ReactNode[]) =>
  template
    .split(TOKEN_PATTERN)
    .map((part, index) =>
      index % 2 === 1 ? (
        <Fragment key={index}>{nodes[Number(part)]}</Fragment>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      )
    );
