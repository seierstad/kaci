/*global module */
"use strict";
let patch = {
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
        "resonance": 1.1,
        "resonanceActive": true,
        "wrapper": "saw",
        "mix": 0,
        "pan": 0,
        "gain": 1,
        "detune": 0,
        "active": true
    },
    "noise": {
        "gain": 0.01,
        "active": false,
        "pan": 0,
        "color": "white"
    },
    "sub": {
        "depth": 0,
        "gain": 0.5,
        "active": true,
        "pan": 0,
        "detune": {
            "mode": "beat",
            "semitone": 0,
            "beat": 0,
            "sync": {
                "enabled": false,
                "numerator": 16,
                "denominator": 3
            }
        }
    },
    "vca": {
        "gain": 1
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
        "mode": "global" /* "voice"  TODO: implement voice LFOs */
    }, {
        "waveform": "sinus",
        "frequency": 0.8,
        "amount": 1.0,
        "active": true,
        "sync": {
            "enabled": false,
            "numerator": 1,
            "denominator": 4,
            "master": 0
        },
        "mode": "voice"
    }],
    "envelopes": [{
        "attack": {
            "steps": [
                [0, 0],
                [0.1, 1],
                [0.3, 0.5],
                [1, 0.5]
            ],
            "duration": 1
        },
        "release": {
            "steps": [
                [0, 0.5],
                [0.2, 0.1],
                [1, 0]
            ],
            "duration": 1
        },
        "mode": "voice"
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
        "mode": "voice"
    }],
    "modulation": {
        "oscillator": {
            "resonance": [{
                "amount": 1,
                "polarity": "positive",
                "enabled": true,
                "source": {
                    "type": "lfo",
                    "index": 0
                }
            }, {
                "amount": .1,
                "polarity": "negative",
                "enabled": false,
                "source": {
                    "type": "env",
                    "index": 0
                }
            }, {
                "amount": .5,
                "polarity": "positive",
                "enabled": true,
                "source": {
                    "type": "lfo",
                    "index": 2
                }
            }],
            "pan": [{
                "amount": 0.5,
                "polarity": "full",
                "enabled": true,
                "source": {
                    "type": "lfo",
                    "index": 1
                }
            }]
        },
        "vca": {
            "gain": [{
                "amount": 1.0,
                "polarity": "positive",
                "enabled": true,
                "source": {
                    "type": "env",
                    "index": 0
                }
            }]
        },
        "noise": {
            "pan": [{
                "amount": 1,
                "polarity": "full",
                "enabled": true,
                "source": {
                    "type": "lfo",
                    "index": 2
                }
            }]
        }
    }
};

let rpatch = {
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
        mode: "global" // TODO: implement support for "global", "retrigger" and "voice"
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


export default patch;
