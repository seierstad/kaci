export const defaultModulationConnectionParameters = {
    "enabled": false,
    "polarity": "full",
    "amount": 0
};

export const defaultLfoParameters = {
    "waveform": "sinus",
    "frequency": 1.0,
    "amount": 1.0,
    "active": true,
    "sync": {
        "enabled": false,
        "numerator": 1,
        "denominator": 1
    },
    "mode": "global" /* "voice"  TODO: implement voice LFOs */
};

export const defaultEnvParameters = {
    "attack": {
        "steps": [
            [0, 0],
            [1, 1]
        ],
        "duration": 1
    },
    "release": {
        "steps": [
            [0, 1],
            [1, 0]
        ],
        "duration": 1
    },
    "mode": "voice"
};

const configuration = {
    "keyboard": {
        "activeLayout": "qwerty",
        "layouts": [{
            "name": "colemak",
            "offset": 36,
            "map": [189, 65, 90, 82, 88, 67, 84, 86, 68, 66, 72, 75, 77, 69, 188, 73, 190, 191, 222, 81, 50, 87, 51, 70, 80, 53, 71, 54, 74, 76, 56, 85, 57, 89, 48, 186, 219],
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
        "endKey": 73
    },
    "midi": {
        "selectedPort": "",
        "channel": "all",
        "ports": []
    },
    "tuning": {
        "baseFrequency": 440,
        "scales": [{
            "type": "tempered",
            "steps": 12,
            "base": 2
        }, {

        }]
    },
    "modulation": {
        "connection": {
            "default": defaultModulationConnectionParameters
        },
        "source": {
            "lfos": {
                "count": 3,
                "amount": {
                    "min": 0,
                    "max": 1,
                    "step": 1 / 12
                },
                "frequency": {
                    "min": 0.001,
                    "max": 50,
                    "step": 0.001
                },
                "sync": {
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
                },
                "default": defaultLfoParameters
            },
            "envelopes": {
                "count": 2,
                "default": defaultEnvParameters,
                "defaultState": {
                    "attack": [],
                    "release": [],
                    "editSustain": false
                }
            }
        },
        "target": {
            "vca": {
                "gain": {
                    "min": 0,
                    "max": 1
                }
            },
            "oscillator": {
                "resonance": {
                    "min": 1,
                    "max": 40
                },
                "mix": {
                    "min": 0,
                    "max": 1
                },
                "detune": {
                    "min": -1200,
                    "max": 1200
                },
                "pan": {
                    "min": -1,
                    "max": 1
                }
            },
            "sub": {
                "gain": {
                    "min": 0,
                    "max": 1
                },
                "pan": {
                    "min": -1,
                    "max": 1
                }
            },
            "noise": {
                "gain": {
                    "min": 0,
                    "max": 1
                },
                "pan": {
                    "min": -1,
                    "max": 1
                }
            }
        }
    }
};

export default configuration;
