import {defaultPeriodicParameters} from "../periodic/defaults";
import {defaultModulatorParameters} from "../modulator/defaults";

export const defaultStepsParameters = {
    ...defaultModulatorParameters,
    ...defaultPeriodicParameters,
    "glide": {
        "up": {
            "time": 0.25,
            "slope": "exponential"
        },
        "down": {
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
