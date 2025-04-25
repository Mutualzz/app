import { formatHex8, type Color } from "culori";

export const alpha = (base: Color, value: number) =>
    formatHex8({ ...base, alpha: value });
