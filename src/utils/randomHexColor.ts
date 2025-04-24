import type { Hex } from "@mutualzz/theme";

export const randomHexColor = (): Hex => {
    const array = new Uint8Array(3);
    crypto.getRandomValues(array);
    const hex: Hex = `#${Array.from(array)
        .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
        .join("")}`;

    return hex;
};
