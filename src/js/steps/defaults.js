import {defaultSyncParameters} from "../sync/defaults";
import {defaultModulatorParameters} from "../modulator/defaults";

export const defaultStepsParameters = {
    ...defaultModulatorParameters,
    "sync": {
        ...defaultSyncParameters
    },
    "glide": {
        "symmetric": true,
        "time": 0.25,
        "slope": "linear",
        "falling": {
            "time": 0.25,
            "slope": "exponential"
        }
    },
    "active": true,
    "maxValue": 4,
    "sequence": [
        {"value": 0},
        {"value": 0},
        {"value": 0},
        {"value": 0}
    ]
};
