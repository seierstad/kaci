import {MORSE_CODE} from "./constants";

export const morseEncode = (text = "") => {
    return text.toLowerCase()
        .replace(/ch/, "C")
        .split("")
        .map(char => (MORSE_CODE[char] || "").split("").join(" "))
        .map(sequence => sequence.replace(/\./g, "1").replace(/-/g, "111"))
        .join("   ").split("").map(p => p === "1");
};

export const padPattern = (pattern, padding = 0) => {
    if (padding === 0) {
        return pattern;
    }
    if (padding < 0) {
        return pattern.slice(0, pattern.length + padding - 1);
    }

    const pad = new Array(padding);
    pad.fill(false);
    return [...pattern, ...pad];
};

export const shiftPattern = (pattern, shift = 0) => {
    if (shift === 0) {
        return pattern;
    }
    return [
        ...pattern.slice(-shift),
        ...pattern.slice(0, -shift)
    ];
};

export const fillPatternToMultipleOf = (pattern, number) => {
    const remainder = pattern.length % number;
    const count = (remainder === 0) ? 0 : number - remainder;

    return padPattern(pattern, count);
};
