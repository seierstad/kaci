import {defaultEnvParameters, defaultEnvViewState} from "./envelope/defaults";
import defaultMidi from "./midi/defaults";
import {defaultModulationConnectionParameters} from "./modulation/defaults";
import {defaultTuning} from "./tuning/defaults";
import {keyboard} from "./keyboard/configuration";
import lfoConfiguration from "./lfo/configuration";
import morseConfiguration from "./morse/configuration";
import stepsConfiguration from "./steps/configuration";

export const outputStageTargets = {
    "gain": {
        "min": 0,
        "max": 1,
        "exponential": true
    },
    "pan": {
        "min": -1,
        "mid": 0,
        "max": 1
    }
};

const configuration = {
    keyboard,
    "midi": {
        ...defaultMidi
    },
    "tuning": {
        ...defaultTuning
    },
    "modulation": {
        "connection": {
            "default": {
                ...defaultModulationConnectionParameters
            }
        },
        "source": {
            "lfo": {
                ...lfoConfiguration
            },
            "envelope": {
                "count": 2,
                "default": defaultEnvParameters,
                "defaultState": defaultEnvViewState
            },
            "steps": {
                ...stepsConfiguration
            },
            "morse": {
                ...morseConfiguration
            }
        },
        "target": {
            "main": {
                ...outputStageTargets
            },
            "oscillator": {
                "waveform": {
                    "min": 0,
                    "mid": 0.5,
                    "max": 1,
                    "patchPath": ["waveform", "parameter"],
                    "wavetableRelevant": true
                },
                "pd_mix": {
                    "min": 0,
                    "max": 1,
                    "wavetableRelevant": true
                },
                "resonance": {
                    "min": 1,
                    "max": 16,
                    "exponential": true,
                    "wavetableRelevant": true
                },
                "wrapper": {
                    "min": 0,
                    "mid": 0.5,
                    "max": 1,
                    "patchPath": ["wrapper", "parameter"],
                    "wavetableRelevant": true
                },
                "harm_mix": {
                    "min": 0,
                    "max": 1,
                    "wavetableRelevant": true
                },
                "detune": {
                    "min": -1200,
                    "mid": 0,
                    "max": 1200
                },
                ...outputStageTargets
            },
            "sub": {
                "detune": {
                    "min": -1,
                    "mid": 0,
                    "max": 1
                },
                "beat": {
                    "min": 0,
                    "max": 20,
                    "exponential": true,
                    "patchPath": ["beat", "frequency"]
                },
                ...outputStageTargets
            },
            "noise": {
                ...outputStageTargets
            },
            "chordShift": {
                "amount": {
                    "min": 0,
                    "max": 1
                }
            }
        }
    }
};

export default configuration;
