import {defaultModulatorParameters} from "../modulator/defaults";
import {defaultSyncParameters} from "../speed/sync/defaults";

export const presetQuotes = [
    "KACI O5",
    "What hath God wrought?",
    "Come at once. We have struck an iceberg",
    "Too choosy, too hesitant, too lazy, too busy.",
    "The secret of a happy life is to know when to stop - and then go that bit further."
];

export const defaultMorseParameters = {
    ...defaultModulatorParameters,
    "speed": {
        "frequency": 1.0,
        "sync": {
            ...defaultSyncParameters
        },
        "speedUnit": 4
    },
    "text": "MORSE",
    "active": true,
    "fillToFit": true,
    "padding": 0,
    "shift": 0,
    "texts": [...presetQuotes],
    "glide": {
        "mode": "symmetric",
        "up": {
            "active": false,
            "time": 0.25,
            "slope": "linear"
        },
        "down": {
            "active": false,
            "time": 0.5,
            "slope": "linear"
        }
    },
    "maxValue": 1
};
