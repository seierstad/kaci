import {MORSE_CODE} from "./constants";

export const morseEncode = (text = "") => {
    return text.toLowerCase()
        .replace(/ch/, "C")
        .split("")
        .map(char => (MORSE_CODE[char] || "").split("").join(" "))
        .map(sequence => sequence.replace(/\./g, "1").replace(/-/g, "111"))
        .join("   ").split("").map(p => p === "1");
};

export const padSequence = (sequence, padding = 0) => {
    if (padding === 0) {
        return sequence;
    }
    if (padding < 0) {
        return sequence.slice(0, sequence.length + padding - 1);
    }

    const pad = new Array(padding);
    pad.fill(false);
    return [...sequence, ...pad];
};

export const shiftSequence = (sequence, shift = 0) => {
    if (shift === 0) {
        return sequence;
    }
    return [
        ...sequence.slice(-shift),
        ...sequence.slice(0, -shift)
    ];
};

export const fillSequenceToMultipleOf = (sequence, number) => {
    const remainder = sequence.length % number;
    const count = (remainder === 0) ? 0 : number - remainder;

    return padSequence(sequence, count);
};

export const getSequence = (patch) => {
    const {
        text,
        shift = 0,
        padding = 0,
        fillToFit = true,
        speed: {
            speedUnit = 0
        }
    } = patch;

    const sequence = morseEncode(text);
    const remainder = (sequence.length + padding) % speedUnit;
    const fitPadding = (speedUnit && fillToFit && remainder !== 0) ? (speedUnit - remainder) : 0;
    const paddedSequence = padSequence(sequence, padding + fitPadding);
    const shiftedSequence = shiftSequence(paddedSequence, shift);

    return shiftedSequence;

};
