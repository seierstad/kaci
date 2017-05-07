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
    "MORSE": "morse"
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
