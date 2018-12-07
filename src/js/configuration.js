import defaultEnvParameters from "./envelope/defaults";

export const defaultModulationConnectionParameters = {
    "enabled": false,
    "polarity": "full",
    "amount": 0
};

export const defaultModulatorParameters = {
    "amount": 1.0,
    "frequency": 1.0,
    "mode": "global"
};

export const defaultSyncParameters = {
    "enabled": false,
    "numerator": 1,
    "denominator": 1
};

export const defaultLfoParameters = {
    ...defaultModulatorParameters,
    "sync": {
        ...defaultSyncParameters
    },
    "active": true,
    "waveform": "sinus"
};

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

export const defaultMorseParameters = {
    ...defaultModulatorParameters,
    "sync": {
        ...defaultSyncParameters
    },
    "text": "MORSE",
    "active": true,
    "fillToFit": true,
    "padding": 0,
    "shift": 0,
    "speedUnit": 4,
    "texts": [
        "KACI O5",
        "What hath God wrought?",
        "Come at once. We have struck an iceberg",
        "Too choosy, too hesitant, too lazy, too busy.",
        "The secret of a happy life is to know when to stop - and then go that bit further."
    ]
};

export const defaultScale = {
    "name": "default",
    "type": "tempered",
    "notes": 12,
    "base": 2,
    "baseKey": 69
};

export const defaultTuning = {
    "baseFrequency": {
        "min": 380,
        "max": 500,
        "value": 440
    },
    "baseKey": 69,
    "keys": {
        "min": 0,
        "max": 128
    },
    "scale": {
        ...defaultScale
    },
    "scales": [defaultScale, {
        "name": "Tempered pentatonic",
        "type": "tempered",
        "notes": 5,
        "base": 2,
        "baseKey": 69
    }, {
        "name": "Pi 18",
        "type": "tempered",
        "notes": 18,
        "base": Math.PI,
        "baseKey": 69
    }, {
        "name": "Bohlen–Pierce 13TET",
        "type": "tempered",
        "notes": 13,
        "base": 3,
        "baseKey": 69
    }, {
        "name": "pythagorean",
        "type": "rational",
        "ratios": [[1, 1], [256, 243], [9, 8], [32, 27], [81, 64], [4, 3], [729, 512], [3, 2], [128, 81], [27, 16], [16, 9], [243, 128], [2, 1]],
        "baseKey": 69
    }, {
        "name": "just",
        "type": "rational",
        "ratios": [[1, 1], [25, 24], [9, 8], [6, 5], [5, 4], [4, 3], [45, 32], [3, 2], [8, 5], [5, 3], [9, 5], [15, 8], [2, 1]],
        "baseKey": 69
    }, {
        "name": "experimental",
        "type": "rational",
        "ratios": [[1, 1], [7, 6], [4, 3], [3, 2], [7, 4], [31, 16], [2, 1]],
        "baseKey": 69
    }, {
        "name": "halvannen",
        "type": "rational",
        "ratios": [[1, 1], [5, 4], [3, 2]],
        "baseKey": 69
    }]
};

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

export const defaultSyncConfiguration = {
    "numerator": {
        "min": 1,
        "max": 64,
        "step": 1
    },
    "denominator": {
        "min": 1,
        "max": 64,
        "step": 1
    }
};

export const harmonicConfiguration = {
    "numerator": {
        "max": 32,
        "min": 1,
        "step": 1
    },
    "denominator": {
        "max": 32,
        "min": 1,
        "step": 1
    },
    "level": {
        "exponential": true,
        "max": 1,
        "min": 0,
        "step": 0.01
    },
    "phase": {
        "max": 0.5,
        "mid": 0,
        "min": -0.5,
        "step": 0.01
    }
};

export const keyboard = {
    "activeLayout": "qwerty",
    "layouts": [{
        "name": "colemak",
        "offset": 36,
        "map": [192, 65, 90, 82, 88, 67, 84, 86, 68, 66, 72, 75, 77, 69, 188, 73, 190, 191, 222, 81, 50, 87, 51, 70, 80, 53, 71, 54, 74, 76, 56, 85, 57, 89, 48, 186, 219],
        "controls": {
            "CHORD_SHIFT_TOGGLE": 32
        }
    }, {
        "name": "qwerty-norwegian",
        "offset": 36,
        "map": [90, 83, 88, 68, 67, 86, 71, 66, 72, 78, 74, 77, 188, 76, 190, 186, 189, 81, 50, 87, 51, 69, 52, 82, 84, 54, 89, 55, 85, 73, 57, 79, 48, 80, 187, 219, 221],
        "controls": {
            "CHORD_SHIFT_TOGGLE": 32
        }
    }, {
        "name": "qwerty",
        "offset": 36,
        "map": [192, 65, 90, 83, 88, 67, 70, 86, 71, 66, 72, 78, 77, 75, 188, 76, 190, 191, 222, 81, 50, 87, 51, 69, 82, 53, 84, 54, 89, 85, 56, 73, 57, 79, 48, 80, 219],
        "controls": {
            "CHORD_SHIFT_TOGGLE": 32
        }
    }],
    "startKey": 36,
    "endKey": 72
};

const configuration = {
    keyboard,
    "midi": {
        "active": false,
        "selectedPort": "",
        "channel": "all",
        "ports": []
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
                "frequency": {
                    "min": 0.001,
                    "max": 50,
                    "step": 0.01,
                    "exponential": true
                },
                "sync": {
                    ...defaultSyncConfiguration
                },
                "default": {
                    ...defaultLfoParameters
                }
            },
            "envelope": {
                "count": 2,
                "default": defaultEnvParameters,
                "defaultState": {
                    "attack": [],
                    "release": [],
                    "editSustain": false
                }
            },
            "steps": {
                "count": 2,
                "amount": {
                    "min": 0,
                    "max": 1,
                    "step": 1 / 12
                },
                "frequency": {
                    "min": 0.001,
                    "max": 5,
                    "step": 0.01,
                    "exponential": true
                },
                "glide": {
                    "min": 0,
                    "max": 1,
                    "step": 0.01
                },
                "sync": {
                    ...defaultSyncConfiguration
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
                "frequency": {
                    "min": 0.001,
                    "max": 5,
                    "step": 0.01,
                    "exponential": true
                },
                "sync": {
                    ...defaultSyncConfiguration
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
                    "exponential": true
                },
                ...outputStageTargets
            },
            "noise": {
                ...outputStageTargets
            },
            "chordshift": {
                "value": {
                    "default": 0,
                    "min": 0,
                    "max": 1
                }
            }
        }
    }
};

export default configuration;
