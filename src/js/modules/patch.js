/*global module */
"use strict";
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
        "resonance": {
            "active": true,
            "factor": 1.1,
            "wrapper": "saw"
        },
        "mix": 0,
        "pan": 0,
        "detune": 0
    },
    "noise": {
        "gain": 0,
        "active": true,
        "pan": 0
    },
    "sub": {
        "depth": -1,
        "gain": 0.3,
        "active": true,
        "pan": 0
    },
    "lfos": [{
        "waveform": "square",
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
            "enabled": true,
            "numerator": 32,
            "denominator": 1
        },
        "mode": "global" /* "voice"  TODO: implement voice LFOs */
    }, {
        "waveform": "sinus",
        "frequency": 0.08,
        "amount": 1.0,
        "active": false,
        "sync": {
            "enabled": true,
            "numerator": 1,
            "denominator": 4
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
        "mode": "local"
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
        "mode": "local"
    }],
    "modulation": {
        "envelopes": [{
            "vca.gain": {
                "amount": 1.0,
                "polarity": "positive",
                "enabled": true
            }
        }, {
            "oscillator.resonance": {
                "amount": 1,
                "polarity": "positive",
                "enabled": true
            }
        }],
        "lfos": [{
            "oscillator.resonance": {
                "amount": .1,
                "polarity": "positive",
                "enabled": true
            },
            "noise.pan": {
                "amount": 1,
                "polarity": "full",
                "enabled": false
            }
        }]
    }
};

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


export {rpatch};
export default patch;
