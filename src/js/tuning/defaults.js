
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
