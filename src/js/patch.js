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
        "gain": 0.2,
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
        "active": true,
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
                "amount": 0.5,
                "polarity": "negative",
                "enabled": true,
                "source": {
                    "type": "lfo",
                    "index": 0
                }
            }]
        }
    }
};

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
