const golombSequence = ({stepCount = 15}) => {
    const sequence = Array(stepCount + 1).fill(0);
    sequence[1] = 1;

    for (let i = 1; i < stepCount; i += 1) {
        sequence[i + 1] = 1 + sequence[i + 1 - sequence[sequence[i]]];
    }

    return sequence.slice(1);
};

// data from the table "Known Optimal Golomb Rulers"
// at http://www.datagenetics.com/blog/february22013/index.html
const golombRulers = {
    2: {
        length:  1,
        marks: [
            [0, 1]
        ]
    },
    3: {
        length:  3,
        marks: [
            [0, 1, 3]
        ]
    },
    4: {
        length:  6,
        marks: [
            [0, 1, 4, 6]
        ]
    },
    5: {
        length:  11,
        marks: [
            [0, 1, 4, 9, 11],
            [0, 2, 7, 8, 11]
        ]
    },
    6: {
        length:  17,
        marks: [
            [0, 1, 4, 10, 12, 17],
            [0, 1, 4, 10, 15, 17],
            [0, 1, 8, 11, 13, 17],
            [0, 1, 8, 12, 14, 17]
        ]
    },
    7: {
        length:  25,
        marks: [
            [0, 1, 4, 10, 18, 23, 25],
            [0, 1, 7, 11, 20, 23, 25],
            [0, 1, 11, 16, 19, 23, 25],
            [0, 2, 3, 10, 16, 21, 25],
            [0, 2, 7, 13, 21, 22, 25]
        ]
    },
    8: {
        length:  34,
        marks: [
            [0, 1, 4, 9, 15, 22, 32, 34]
        ]
    },
    9: {
        length:  44,
        marks: [
            [0, 1, 5, 12, 25, 27, 35, 41, 44]
        ]
    },
    10: {
        length: 55,
        marks: [
            [0, 1, 6, 10, 23, 26, 34, 41, 53, 55]
        ]
    },
    11: {
        length: 72,
        marks: [
            [0, 1, 4, 13, 28, 33, 47, 54, 64, 70, 72],
            [0, 1, 9, 19, 24, 31, 52, 56, 58, 69, 72]
        ]
    },
    12: {
        length: 85,
        marks: [
            [0, 2, 6, 24, 29, 40, 43, 55, 68, 75, 76, 85]
        ]
    },
    13: {
        length: 106,
        marks: [
            [0, 2, 5, 25, 37, 43, 59, 70, 85, 89, 98, 99, 106]
        ]
    },
    14: {
        length: 127,
        marks: [
            [0, 4, 6, 20, 35, 52, 59, 77, 78, 86, 89, 99, 122, 127]
        ]
    },
    15: {
        length: 151,
        marks: [
            [0, 4, 20, 30, 57, 59, 62, 76, 100, 111, 123, 136, 144, 145, 151]
        ]
    },
    16: {
        length: 177,
        marks: [
            [0, 1, 4, 11, 26, 32, 56, 68, 76, 115, 117, 134, 150, 163, 168, 177]
        ]
    },
    17: {
        length: 199,
        marks: [
            [0, 5, 7, 17, 52, 56, 67, 80, 81, 100, 122, 138, 159, 165, 168, 191, 199]
        ]
    },
    18: {
        length: 216,
        marks: [
            [0, 2, 10, 22, 53, 56, 82, 83, 89, 98, 130, 148, 153, 167, 188, 192, 205, 216]
        ]
    },
    19: {
        length: 246,
        marks: [
            [0, 1, 6, 25, 32, 72, 100, 108, 120, 130, 153, 169, 187, 190, 204, 231, 233, 242, 246]
        ]
    },
    20: {
        length: 283,
        marks: [
            [0, 1, 8, 11, 68, 77, 94, 116, 121, 156, 158, 179, 194, 208, 212, 228, 240, 253, 259, 283]
        ]
    },
    21: {
        length: 333,
        marks: [
            [0, 2, 24, 56, 77, 82, 83, 95, 129, 144, 179, 186, 195, 255, 265, 285, 293, 296, 310, 329, 333]
        ]
    },
    22: {
        length: 356,
        marks: [
            [0, 1, 9, 14, 43, 70, 106, 122, 124, 128, 159, 179, 204, 223, 253, 263, 270, 291, 330, 341, 353, 356]
        ]
    },
    23: {
        length: 372,
        marks: [
            [0, 3, 7, 17, 61, 66, 91, 99, 114, 159, 171, 199, 200, 226, 235, 246, 277, 316, 329, 348, 350, 366, 372]
        ]
    },
    24: {
        length: 425,
        marks: [
            [0, 9, 33, 37, 38, 97, 122, 129, 140, 142, 152, 191, 205, 208, 252, 278, 286, 326, 332, 353, 368, 384, 403, 425]
        ]
    },
    25: {
        length: 480,
        marks: [
            [0, 12, 29, 39, 72, 91, 146, 157, 160, 161, 166, 191, 207, 214, 258, 290, 316, 354, 372, 394, 396, 431, 459, 467, 480]
        ]
    },
    26: {
        length: 492,
        marks: [
            [0, 1, 33, 83, 104, 110, 124, 163, 185, 200, 203, 249, 251, 258, 314, 318, 343, 356, 386, 430, 440, 456, 464, 475, 487, 492]
        ]
    }
};

const golombRuler = ({order = 4, solutionIndex = 0, values = [0, 1]}) => {
    const {
        [order]: config
    } = golombRulers;

    if (config) {
        const {
            length,
            marks: solutions = []
        } = config;

        const {
            [solutionIndex]: marks = solutions[solutions.length - 1]
        } = solutions;

        const result = Array(length);
        for (let i = 0, j = marks.length - 1; i < j; i += 1) {
            result.fill(values[i % values.length], marks[i], marks[i + 1]);
        }

        return result;
    }

    return [0];
};


const barkerCodes = {
    2: [1, -1],
    3: [1, 1, -1],
    4: [1, 1, -1, 1],
    5: [1, 1, 1, -1, 1],
    7: [1, 1, 1, -1, -1, 1, -1],
    11: [1, 1, 1, -1, -1, -1, 1, -1, -1, 1, -1],
    13: [1, 1, 1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1]
};

const barkerCode = ({length = 7}) => {
    if (barkerCodes[length]) {
        return barkerCodes[length];
    }
    return [0];
};

const linusSequence = ({length = 8}) => {
    const regexpFn = pattern => pattern.match(/(.*)\1$/)[0].length;
    let c = "1";
    while (c.length < length) {
        c += regexpFn(c + 1) > regexpFn(c + 2) ? 2 : 1;
    }

    return c.split("").map(c => parseInt(c, 10));
};

const linusSequenceRunningSum = ({length = 8}) => {
    const regexpFn = pattern => pattern.match(/(.*)\1$/)[0].length;
    let c = "1";
    let sum = [0];
    while (c.length < length) {
        if (regexpFn(c + 1) > regexpFn(c + 2)) {
            c += 2;
            sum.push(sum[sum.length - 1] + 1);
        } else {
            c += 1;
            sum.push(sum[sum.length - 1] - 1);
        }
    }

    return sum;
};

const sallySequence = ({length = 8, noInitialZero = false}) => {
    const regexpFn = pattern => pattern.match(/(.*)\1$/);
    const generateLength = parseInt(length, 10) + (noInitialZero ? 1 : 0);

    let sally = [0];
    let linus = "1";

    while (linus.length < generateLength) {
        const match1 = regexpFn(linus + 1);
        const match2 = regexpFn(linus + 2);
        if (match1[0].length > match2[0].length) {
            linus += 2;
            sally.push(match1[1].length);
        } else {
            linus += 1;
            sally.push(match2[1].length);
        }
    }

    if (noInitialZero) {
        return sally.slice(1);
    }

    return sally;
};

export const generatorDescriptors = [{
    label: "Golomb sequence",
    name: "golombSequence",
    parameters: [{
        label: "step count",
        name: "stepCount",
        type: "number",
        range: "positive",
        minValue: 2,
        maxValue: Number.MAX_SAFE_INTEGER,
        defaultValue: 16
    }]
}, {
    label: "Golomb ruler",
    name: "golombRuler",
    parameters: [{
        label: "order",
        name: "order",
        type: "enumeration",
        values: Array.of(...Object.keys(golombRulers)),
        defaultValue: 4
    }, {
        label: "solution",
        name: "solutionIndex",
        type: "enumeration",
        values: [0, 1, 2, 3, 4],
        defaultValue: 0
    }]
}, {
    label: "Barker code",
    name: "barkerCode",
    parameters: [{
        label: "length",
        name: "length",
        type: "enumeration",
        values: [2, 3, 4, 5, 7, 11, 13],
        defaultValue: 7
    }]
}, {
    label: "Linus sequence",
    name: "linusSequence",
    parameters: [{
        label: "length",
        name: "length",
        type: "number",
        range: "positive",
        minValue: 2,
        maxValue: Number.MAX_SAFE_INTEGER,
        defaultValue: 16
    }]
}, {
    label: "Linus sequence, running sum",
    name: "linusSequenceRunningSum",
    parameters: [{
        label: "length",
        name: "length",
        type: "number",
        range: "positive",
        minValue: 2,
        maxValue: Number.MAX_SAFE_INTEGER,
        defaultValue: 16
    }]
}, {
    label: "Sally sequence",
    name: "sallySequence",
    parameters: [{
        label: "length",
        name: "length",
        type: "number",
        range: "positive",
        minValue: 2,
        maxValue: Number.MAX_SAFE_INTEGER,
        defaultValue: 16
    }, {
        label: "skip initial zero value",
        name: "noInitialZero",
        type: "checkbox",
        defaultValue: false
    }]
}];

export const generatorFunctions = {
    barkerCode,
    golombRuler,
    golombSequence,
    linusSequence,
    linusSequenceRunningSum,
    sallySequence
};
