import {
    defaultModulatorParameters
} from "../modulator/defaults";
import {
    defaultSyncParameters
} from "../sync/defaults";


const defaultMorseParameters = {
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
    "texts": [
        "KACI O5",
        "What hath God wrought?",
        "Come at once. We have struck an iceberg",
        "Too choosy, too hesitant, too lazy, too busy.",
        "The secret of a happy life is to know when to stop - and then go that bit further."
    ]
};

export default defaultMorseParameters;
