const defaultEnvParameters = {
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

const defaultEnvViewState = {
    attack: [],
    release: [],
    editSustain: false
};

export {
    defaultEnvParameters,
    defaultEnvViewState
};
