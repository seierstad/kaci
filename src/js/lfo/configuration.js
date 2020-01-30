import {defaultSyncConfiguration} from "../speed/sync/defaults";
import {defaultLfoParameters} from "./defaults";


export const configuration = {
    "count": 3,
    "amount": {
        "min": 0,
        "max": 1,
        "step": 1 / 12
    },
    "speed": {
        "frequency": {
            "min": 0.001,
            "max": 50,
            "step": 0.01,
            "exponential": true
        },
        "sync": {
            ...defaultSyncConfiguration
        }
    },
    "default": {
        ...defaultLfoParameters
    }
};

export default configuration;
