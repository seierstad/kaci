import {defaultSyncParameters} from "../sync/defaults";
import {defaultModulatorParameters} from "../modulator/defaults";


export const defaultLfoParameters = {
    ...defaultModulatorParameters,
    "sync": {
        ...defaultSyncParameters
    },
    "active": true,
    "waveform": "sinus"
};