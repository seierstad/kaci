const patch = {
    "oscillator": {
        "waveform": "triangle",
        "pd": [{
            "steps": [
                [0, 0],
                [1, 1]
            ]
        }, {
            "steps": [
                [0, 0],
                [0.45, 0.25],
                [0.5733333333333334, 0.8433333333333333],
                [1, 1]
            ]
        }],
        "resonance": 3,
        "resonanceActive": true,
        "wrapper": {"name": "gaussian", "parameters": {mu: 0.5, sig: 0.2}},
        "mix": 0,
        "detune": 0,
        "active": true,
        "gain": 0.7,
        "pan": 0
    },
    "noise": {
        "color": "white",
        "active": false,
        "gain": 0.75,
        "pan": 0
    },
    "sub": {
        "depth": 0,
        "mode": "beat",
        "detune": 0,
        "beat": 0,
        "beat_sync": {
            "enabled": false,
            "numerator": 16,
            "denominator": 3
        },
        "active": false,
        "gain": 0.51,
        "pan": 0
    },
    "main": {
        "active": true,
        "gain": 1,
        "pan": 0
    },
    "lfos": [{
        "waveform": "sinus",
        "frequency": 1.34,
        "amount": 1,
        "active": true,
        "mode": "global"
    }, {
        "waveform": "additiveSaw",
        "frequency": 6.4,
        "amount": 0.5,
        "active": true,
        "sync": {
            "enabled": false,
            "numerator": 32,
            "denominator": 1,
            "master": 0
        },
        "mode": "global"
    }, {
        "waveform": "square",
        "frequency": 1.34,
        "amount": 1.0,
        "active": true,
        "sync": {
            "enabled": false,
            "numerator": 1,
            "denominator": 4,
            "master": 0
        },
        "mode": "global"
    }],
    "envelopes": [{
        "attack": {
            "steps": [
                [0, 0],
                [0.1, 1],
                [0.3, 0.5],
                [1, 0.5]
            ],
            "duration": 0.2
        },
        "release": {
            "steps": [
                [0, 0.5],
                [0.2, 0.1],
                [1, 0]
            ],
            "duration": 0.2
        },
        "mode": "global"
    }, {
        "attack": {
            "steps": [
                [0, 0.5],
                [0.3, 0.5],
                [1, 1]
            ],
            "duration": 1
        },
        "release": {
            "steps": [
                [0, 1],
                [0.2, 0.1],
                [1, 0]
            ],
            "duration": 0.1
        },
        "mode": "global"
    }],
    "morse": [{
        "text": "H2O",
        "frequency": 1,
        "speedUnit": 14,
        "shift": 0,
        "padding": 0,
        "fillToFit": true,
        "amount": 1,
        "active": true,
        "mode": "global",
        "sync": {
            "enabled": false,
            "numerator": 1,
            "denominator": 4,
            "master": 0
        }
    }],
    "modulation": {
        "main": {
            "gain": [{
                "amount": 1,
                "enabled": true,
                "polarity": "positive",
                "source": {
                    "type": "env",
                    "index": 0
                }
            }]
        },
        "oscillator": {
            "resonance": [{
                "amount": 0.5,
                "polarity": "positive",
                "enabled": true,
                "source": {
                    "type": "morse",
                    "index": 0
                }
            }],
            "gain": [{
                "amount": 0.5,
                "polarity": "positive",
                "enabled": true,
                "source": {
                    "type": "lfo",
                    "index": 1
                }
            }]
        }
    }
};

export const patches = [{
    name: "test 1",
    main: {
        active: true,
        gain: 1,
        pan: 0
    },
    oscillator: {
        waveform: "additiveTriangle",
        pd: [{
            steps: [
                [0, 0],
                [1, 1]
            ]
        }, {
            steps: [
                [0, 0],
                [0.45, 0.25],
                [0.5333333333333333, 0.9479166666666666],
                [1, 1]
            ]
        }],
        resonance: 3.789130076237144,
        resonanceActive: true,
        wrapper: "gaussian",
        mix: 0.454,
        detune: 0,
        active: true,
        gain: 0.20413738123141578,
        pan: 0
    },
    noise: {
        color: "geometric",
        active: false,
        gain: 0,
        pan: -0.439
    },
    sub: {
        depth: -1,
        mode: "beat",
        detune: 0,
        beat: 0.9390218215208441,
        beat_sync: {
            enabled: false,
            numerator: 16,
            denominator: 3
        },
        active: false,
        gain: 1,
        pan: 0
    },
    lfos: [{
        waveform: "sinus",
        frequency: 0.018450809317107852,
        amount: 1,
        active: true,
        mode: "global"
    }, {
        waveform: "additiveSquare",
        frequency: 0.8303075076945439,
        amount: 0.833333333333333,
        active: true,
        sync: {
            enabled: false,
            numerator: 32,
            denominator: 1,
            master: 0
        },
        mode: "voice"
    }, {
        waveform: "additiveSaw",
        frequency: 0.20966547862318374,
        amount: 1,
        active: true,
        sync: {
            enabled: false,
            numerator: 1,
            denominator: 4,
            master: 0
        },
        mode: "global"
    }],
    envelopes: [{
        attack: {
            steps: [
                [0, 0],
                [0.1, 1],
                [0.3026378154213045, 0.8066666666666666],
                [1, 0.5]
            ],
            duration: 2
        },
        release: {
            steps: [
                [0, 0.5],
                [0.2, 0.1],
                [1, 0]
            ],
            duration: 1
        },
        mode: "global"
    }, {
        attack: {
            steps: [
                [0, 0.5],
                [0.08195221746549113, 1],
                [1, 0.76]
            ],
            duration: 0.1
        },
        release: {
            steps: [
                [0, 0.76],
                [0.2, 0.1],
                [0.621702710449474, 0.21333333333333337],
                [0.7475579015571925, 0.7466666666666666],
                [1, 0]
            ],
            duration: 1
        },
        mode: "global"
    }],
    morse: [{
        text: "H2O ",
        frequency: 0.5887587079704666,
        speedUnit: 43,
        shift: 0,
        padding: 0,
        fillToFit: false,
        amount: 1,
        active: true,
        mode: "global",
        sync: {
            enabled: false,
            numerator: 1,
            denominator: 4,
            master: 0
        }
    }],
    modulation: {
        main: {
            gain: [{
                amount: 1,
                enabled: false,
                polarity: "negative",
                source: {
                    type: "env",
                    index: 0
                }
            }, {
                enabled: true,
                polarity: "positive",
                amount: 0,
                source: {
                    type: "env",
                    index: 1
                }
            }]
        },
        oscillator: {
            resonance: [{
                amount: 0.5,
                polarity: "positive",
                enabled: false,
                source: {
                    type: "morse",
                    index: 0
                }
            }, {
                enabled: true,
                polarity: "positive",
                amount: 0.92,
                source: {
                    type: "env",
                    index: 0
                }
            }],
            gain: [{
                amount: 0.5,
                polarity: "positive",
                enabled: true,
                source: {
                    type: "lfo",
                    index: 1
                }
            }],
            detune: [{
                enabled: false,
                polarity: "positive",
                amount: 0.08,
                source: {
                    type: "lfo",
                    index: 0
                }
            }, {
                enabled: false,
                polarity: "negative",
                amount: 1,
                source: {
                    type: "morse",
                    index: 0
                }
            }],
            mix: [{
                enabled: true,
                polarity: "full",
                amount: 0.42,
                source: {
                    type: "lfo",
                    index: 0
                }
            }]
        },
        sub: {
            detune: [{
                enabled: true,
                polarity: "positive",
                amount: 1,
                source: {
                    type: "env",
                    index: 0
                }
            }]
        },
        noise: {
            gain: [{
                enabled: true,
                polarity: "positive",
                amount: 0.14,
                source: {
                    type: "lfo",
                    index: 2
                }
            }],
            pan: [{
                enabled: false,
                polarity: "full",
                amount: 1,
                source: {
                    type: "lfo",
                    index: 0
                }
            }]
        }
    }
}];

/*
const rpatch = {
    oscillator: {
        waveform: "triangle",
        pdEnvelope0: [
            [0, 0],
            [1, 1]
        ],
        pdEnvelope1: [
            [0, 0],
            [0.45, 0.25],
            [0.6, 0.8],
            [1, 1]
        ],
        resonanceActive: true,
        resonance: 1.1,
        wrapper: "saw",
        mix: 0,
        detune: 0
    },
    lfo: [{
        waveform: "square",
        frequency: 1.34,
        amount: 1,
        mode: "global"
    }, {
        waveform: "additiveSaw",
        frequency: 6.4,
        amount: 0.4,
        syncEnabled: true,
        syncRatioNumerator: 32,
        syncRatioDenominator: 1
    }, {
        waveform: "square",
        frequency: 0.08,
        amount: 0.1,
        syncEnabled: true,
        syncRatioNumerator: 1,
        syncRatioDenominator: 4
    }],
    envelope: [{
        attack: {
            steps: [
                [0, 0],
                [0.1, 1],
                [0.3, 0.5],
                [1, 0.5]
            ],
            duration: 1
        },
        release: {
            steps: [
                [0, 0.5],
                [0.2, 0.1],
                [1, 0]
            ],
            duration: 1
        }
    }, {
        attack: {
            steps: [
                [0, 0.5],
                [0.3, 0.5],
                [1, 1]
            ],
            duration: 2
        },
        release: {
            steps: [
                [0, 1],
                [0.2, 0.1],
                [1, 0]
            ],
            duration: 0.5
        }
    }],
    modulation: { // not implemented yet... structure supposed to be along these lines..
        envelope: [{
            "oscillator.amplitude": {
                "amount": 1.0,
                "type": "other modulation properties than amount might be useful..."
            },
            "oscillator.mix": {
                "amount": 0.3
            }
        }],
        lfo: [{
            "oscillator.detune": {
                "amount": 1
            }
        }]
    }
};
*/

export default patch;
