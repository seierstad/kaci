export const BUFFER_LENGTH = 1024; // 4096; //2048,
export const DOUBLE_PI = Math.PI * 2;
export const TRIPLE_PI = Math.PI * 3;

// values where sinc(value) == cos(value) = local peaks (suitable loop points) for the sinc function
export const SINC_EXTREMA = [
    0,
    4.493409457909063,
    7.725251836937707,
    10.904121659428899,
    14.066193912831473,
    17.220755271930768,
    20.37130295928756
];

export const NOTE_NAMES = ["c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b"];


export const NEW_AGE = {
    "MAGIC_NUMBERS": {
        "WATER_A": 432,
        "WATER_C": 128
    },
    "SOLFEGGIO": {
        "LOWEST_POSSIBLE": 63,
        "PAINKILLER": 174, // "reduce pain"
        "ENERGY": 285, // influence energy fields"
        "UT": 396, // "turn grief into joy"
        "RE": 417, // "facilitate change"
        "MI": 528, // "transformation & miracles"
        "FA": 639, // "reconnecting, relationships"
        "SOL": 741, // "expressions/solutions"
        "LA": 852, // "return to spiritual order"
        "SI": 963, // "awaken perfect state"
        "HIGHER_1": 1074,
        "HIGHER_2": 1185,
        "HIGHER_3": 1296,
        "HIGHER_4": 1317
    }
};

export const UNICODE_FRACTIONAL_SLASH = "⁄";
