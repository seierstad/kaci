import {defaultSyncParameters} from "../speed/sync/defaults";
import {defaultModulatorParameters} from "../modulator/defaults";
import defaultWaveformParameters from "../waveform/defaults";

export const defaultLfoParameters = {
    ...defaultModulatorParameters,
    "sync": {
        ...defaultSyncParameters
    },
    "active": true,
    "waveform": {
        ...defaultWaveformParameters
    }
};
