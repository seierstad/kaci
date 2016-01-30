/*global module */
"use strict";
var patch = {
    "oscillator": {
        "waveform": "triangle",
        "pdEnvelope0": [
            [0, 0],
            [1, 1]
        ],
        "pdEnvelope1": [
            [0, 0],
            [0.45, 0.25],
            [0.5733333333333334, 0.8433333333333333],
            [1, 1]
        ],
        "resonanceActive": true,
        "resonance": 1.1,
        "wrapper": "saw",
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
        "ratio": 1,
        "gain": 0.3,
        "active": true,
        "pan": 0
    },
    "lfo": [{
        "waveform": "square",
        "frequency": 1.34,
        "amount": 1,
        "active": true,
        "mode": "global"
    }, {
        "waveform": "additiveSaw",
        "frequency": 6.4,
        "amount": 1.0,
        "syncEnabled": true,
        "syncRatioNumerator": 32,
        "syncRatioDenominator": 1,
        "active": true,
        "mode": "global" /* "voice"  TODO: implement voice LFOs */
    }, {
        "waveform": "sinus",
        "frequency": 0.08,
        "amount": 1.0,
        "syncEnabled": true,
        "syncRatioNumerator": 1,
        "syncRatioDenominator": 4,
        "active": false,
        "mode": "global"
    }],
    "envelope": [{
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
        mode: "local"
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
        mode: "local"
    }],
    "modulation": {
        "envelope": [{
            "vca.gain": {
                "amount": 1.0,
                "range": "positive"
            },
            "oscillator.mix": {
                "amount": 0.3,
                "range": "positive"
            }
        }, {
            "oscillator.resonance": {
                "amount": 1,
                "range": "positive"
            }
        }],
        "lfo": [{
            "oscillator.detune": {
                "amount": .1,
                "range": "positive"
            },
        }, {
            "oscillator.resonance": {
                "amount": .1,
                "range": "positive"
            },
            "noise.pan": {
                "amount": 1,
                "range": "full"
            }
        }, {
            "noise.gain": {
                "amount": .1,
                "range": "positive"
            }
        }]
    }
};

var rpatch = {
    oscillator: {
        waveform: 'triangle',
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
        wrapper: 'saw',
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
module.exports = patch;