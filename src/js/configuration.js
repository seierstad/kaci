import {defaultEnvParameters, defaultEnvViewState} from "./envelope/defaults";
import defaultMidi from "./midi/defaults";
import defaultMorseParameters from "./morse/defaults";
import {defaultModulationConnectionParameters} from "./modulation/defaults";
import {defaultTuning} from "./tuning/defaults";
import {keyboard} from "./keyboard/configuration";
import {defaultStepsParameters} from "./steps/defaults";
import {defaultLfoParameters} from "./lfo/defaults";
import {defaultSyncConfiguration} from "./speed/sync/defaults";


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
            },
            "envelope": {
                "count": 2,
                "default": defaultEnvParameters,
                "defaultState": defaultEnvViewState
            },
            "steps": {
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
                "glide": {
                    "min": 0,
                    "max": 1,
                    "step": 0.01
                },
                "default": {
                    ...defaultStepsParameters
                }
            },
            "morse": {
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
            }
        },
        "target": {
            "main": {
                ...outputStageTargets
            },
            "oscillator": {
                "resonance": {
                    "min": 1,
                    "max": 16,
                    "exponential": true
                },
                "mix": {
                    "min": 0,
                    "max": 1
                },
                "detune": {
                    "min": -1200,
                    "mid": 0,
                    "max": 1200
                },
                "waveform": {
                    "min": 0,
                    "mid": 0.5,
                    "max": 1,
                    "patchPath": ["waveform", "parameter"]
                },
                "wrapper": {
                    "min": 0,
                    "mid": 0.5,
                    "max": 1,
                    "patchPath": ["wrapper", "parameter"]
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
