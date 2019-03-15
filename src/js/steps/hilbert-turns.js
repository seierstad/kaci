const positions = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0]
];

function hilbertCoordinates (index, size) {
    let pos = positions[index & 3];

    for (let curr = (index >>> 2), n = 4; n <= size; n *= 2, curr = (curr >>> 2)) {
        const n2 = n / 2;
        const [x, y] = pos;

        switch (curr & 3) {
            case 0:
                pos = [y, x];
                break;

            case 1:
                pos = [x, y + n2];
                break;

            case 2:
                pos = [x + n2, y + n2];
                break;

            case 3:
                pos = [(n2 - 1) - y + n2, (n2 - 1) - x];
                break;
        }
    }

    return pos;
}

const directions = {
    "LEFT": 1,
    "DOWN": 2,
    "RIGHT": 3,
    "UP": 4
};

const turns = {
    "LEFT": -1,
    "NONE": 0,
    "RIGHT": 1
};

function direction ([prevX, prevY] = [], [currX, currY] = []) {

    if (prevX !== currX) {
        if (currX < prevX) {
            return directions["LEFT"];
        }
        return directions["RIGHT"];
    }

    if (currY < prevY) {
        return directions["DOWN"];
    }
    return directions["UP"];
}

function hilbertTurns ({size, runningSum = false}) {
    const result = [0];
    let prev = hilbertCoordinates(1, size);

    let prevDir = direction(hilbertCoordinates(0, size), prev);

    for (let i = 2, length = Math.pow(size, 2); i < length; i += 1) {
        let coordinates = hilbertCoordinates(i, size);
        let dir = direction(prev, coordinates);
        let turn = turns["NONE"];

        if (dir > prevDir) {
            if (dir === directions["UP"] && prevDir === directions["LEFT"]) {
                turn = turns["RIGHT"];
            } else {
                turn = turns["LEFT"];
            }
        } else if (dir < prevDir) {
            if (dir === directions["LEFT"] && prevDir === directions["UP"]) {
                turn = turns["LEFT"];
            } else {
                turn = turns["RIGHT"];
            }
        }

        prevDir = dir;
        prev = coordinates;
        result.push(runningSum ? (result[result.length - 1] + turn) : turn);
    }

    return result;
}

export const description = {
    label: "Hilbert turns",
    name: "hilbertTurns",
    parameters: [{
        label: "size",
        name: "size",
        type: "enumeration",
        values: [2, 4, 8, 16, 32],
        defaultValue: 8
    }, {
        label: "running sum",
        name: "runningSum",
        type: "checkbox",
        defaultValue: false
    }]
};

export default hilbertTurns;
