export const BUFFER_LENGTH = 1024; // 4096; //2048,
export const DOUBLE_PI = Math.PI * 2;
export const NOTE_NAMES = ["c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b"];
export const LOCALSTORAGE_NAME = "Kaci_configuration";

export const MODULATION_SOURCE_MODE = {
    "GLOBAL": "global",
    "VOICE": "voice",
    "RETRIGGER": "retrigger"
};

export const MODULATION_SOURCE_TYPE = {
    "ENVELOPE": "env",
    "LFO": "lfo",
    "MORSE": "morse",
    "STEPS": "steps"
};

export const OSCILLATOR_MODE = {
    "RESONANT": "resonant",
    "HARMONICS": "harmonics"
};

export const CHORD_SHIFT_MODE = {
    "PORTAMENTO": "portamento",
    "GLISSANDO": "glissando"
};

export const RANGE = {
    "FULL": "full",
    "POSITIVE": "positive",
    "NEGATIVE": "negative"
};

export const MORSE_CODE = {
    "a": ".-",
    "b": "-...",
    "c": "-.-.",
    "d": "-..",
    "e": ".",
    "f": "..-.",
    "g": "--.",
    "h": "....",
    "i": "..",
    "j": ".---",
    "k": "-.-",
    "l": ".-..",
    "m": "--",
    "n": "-.",
    "o": "---",
    "p": ".--.",
    "q": "--.-",
    "r": ".-.",
    "s": "...",
    "t": "-",
    "u": "..-",
    "v": "...-",
    "w": ".--",
    "x": "-..-",
    "y": "-.--",
    "z": "--..",
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    "à": ".--.-",
    "å": ".--.-",
    "ä": ".-.-",
    "æ": ".-.-",
    "ch": "----",
    "è": ".-..-",
    "é": "..-..",
    "ø": "---.",
    "ö": "---.",
    "ü": "..--",
    "ß": "...--..",
    "ñ": "--.--",
    ".": ".-.-.-",
    ",": "--..--",
    ":": "---...",
    ";": "-.-.-.",
    "!": ".-.--",
    "?": "..--..",
    "-": "-....-",
    "_": "..--.-",
    "(": "-.--.",
    ")": "-.--.-",
    "&": ".-...",
    "'": ".----.",
    "\"": ".-..-.",
    "$": "...-..-",
    "=": "-...-",
    "+": ".-.-.",
    "/": "-..-.",
    "@": ".--.-.",
    " ": " "
};

MORSE_CODE["C"] = MORSE_CODE["ch"]; // for easier lookup

export const UNICODE_FRACTION = {
    1: {
        2: "½",
        3: "⅓",
        4: "¼",
        8: "⅛"
    },
    2: {
        3: "⅔"
    },
    3: {
        4: "¾",
        8: "⅜"
    },
    5: {
        8: "⅝"
    },
    7: {
        8: "⅞"
    }
};

export const UNICODE_SUPERSCRIPT = {
    0: "⁰",
    1: "¹",
    2: "²",
    3: "³",
    4: "⁴",
    5: "⁵",
    6: "⁶",
    7: "⁷",
    8: "⁸",
    9: "⁹"
};

export const UNICODE_SUBSCRIPT = {
    0: "₀",
    1: "₁",
    2: "₂",
    3: "₃",
    4: "₄",
    5: "₅",
    6: "₆",
    7: "₇",
    8: "₈",
    9: "₉"
};

export const UNICODE_FRACTIONAL_SLASH = "⁄";
