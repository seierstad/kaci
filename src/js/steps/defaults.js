import {defaultSyncParameters} from "../sync/defaults";
import {defaultModulatorParameters} from "../modulator/defaults";

export const defaultStepsParameters = {
    ...defaultModulatorParameters,
    "sync": {
        ...defaultSyncParameters
    },
    "active": true,
    "levels": 4,
    "steps": [
        {"value": 0},
        {"value": 0},
        {"value": 0},
        {"value": 0}
    ]
};
