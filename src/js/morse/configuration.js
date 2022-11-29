import {defaultSyncConfiguration} from "../speed/sync/defaults";
import {defaultMorseParameters} from "./defaults";


export const configuration = {
    "count": 2,
    "amount": {
        "min": 0,
        "max": 1,
        "step": 1 / 12
    },
    "speed": {
        "frequency": {
            "min": 0.001,
            "max": 5,
            "step": 0.01,
            "exponential": true
        },
        "speedUnit": {
            "min": 0,
            "max": Number.MAX_SAFE_INTEGER,
            "step": 1
        },
        "sync": {
            ...defaultSyncConfiguration
        }
    },
    "default": {
        ...defaultMorseParameters
    }
};

export default configuration;