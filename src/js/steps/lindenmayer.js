
const hilbertCurve = {
    name: "Hilbert curve",
    description: "Representation of the Hilbert curve. -1 = turn right, 0 = move forward, 1 = turn left",
    href: "https://en.wikipedia.org/wiki/Hilbert_curve",
    variables: ["A", "B"],
    constants: ["0", "F", "2"],
    axiom: "A",
    rules: {
        "A": "0BF2AFA2FB0",
        "B": "2AF0BFB0FA2"
    },
    finalFn: (variables, str) => str.replace(/(02|20)/g, "1")
        .split("")
        .filter(t => variables.indexOf(t) === -1 && t !== "F")
        .map(c => parseInt(c, 10) - 1)
};

const mooreCurve = {
    name: "Moore curve",
    description: "Representation of the Moore curve. -1 = turn left, 0 = move forward, 1 = turn right",
    href: "https://en.wikipedia.org/wiki/Moore_curve",
    variables: ["L", "R"],
    constants: ["F", "+", "-"],
    axiom: "LFL+F+LFL",
    rules: {
        "L": "-RF+LFL+FR-",
        "R": "+LF-RFR-FL+"
    },
    finalFn: (variables, str) => str.split("")
        .filter(t => variables.indexOf(t) === -1)
        .map(c => ["-", "F", "+"].indexOf(c) - 1)
};

const thueMorseSequence = {
    variables: [0, 1],
    constants: [],
    axiom: "0",
    rules: {
        "0": "01",
        "1": "10"
    },
    finalFn: (variables, str) => str.split("").map(c => parseInt(c, 10))
};

const sierpinskiCurve = {
    name: "Sierpiński curve",
    description: "Representation of the 45° turns in a Sierpiński snowflake curve. -1 = a right turn, 1 = a left turn",
    href: "https://en.wikipedia.org/wiki/Sierpi%C5%84ski_curve",
    variables: ["F", "G", "X"],
    constants: ["F", "G", "+", "-"],
    axiom: "F--XF--F--XF",
    rules: {
        "X": "XF+G+XF--F--XF+G+X"
    },
    finalFn: (variables, str) => str.split("")
        .filter(t => variables.indexOf(t) === -1)
        .map(c => ["-", "F", "G", "+"].indexOf(c) - 1)
};

const sierpinskiArrow = {
    name: "Sierpiński arrowhead curve",
    description: "Representation of the 60° turns in a Sierpiński arrowhead curve. -1 = a right turn, 1 = a left turn",
    href: "https://en.wikipedia.org/wiki/Sierpi%C5%84ski_curve",
    variables: ["X", "Y"],
    constants: ["F", "+", "−"],
    axiom: "XF",
    rules: {
        "X": "YF+XF+Y",
        "Y": "XF-YF-X"
    },
    finalFn: (variables, str) => str.split("")
        .filter(t => variables.indexOf(t) === -1)
        .map(c => ["-", "F", "+"].indexOf(c) - 1)
};

const systems = {
    hilbertCurve,
    mooreCurve,
    thueMorseSequence,
    sierpinskiCurve,
    sierpinskiArrow
};


const lindenmayer = ({systemName, iterations}) => {
    const def = systems[systemName];

    let result = def.axiom.slice();

    const regExpStr = "(" + Object.keys(def.rules).join("|") + ")";
    const regExp = new RegExp(regExpStr, "g");

    for (let i = 0; i < iterations; i += 1) {
        result = result.replace(regExp, (match) => {
            return def.rules[match];
        });
    }

    return def.finalFn(def.variables, result);
};

export const description = {
    label: "Lindenmayer systems",
    name: "lindenmayer",
    parameters: [{
        label: "iterations",
        name: "iterations",
        type: "number",
        range: "positive",
        minValue: 0,
        maxValue: Number.MAX_SAFE_INTEGER,
        defaultValue: 2
    }, {
        label: "system",
        name: "systemName",
        type: "enumeration",
        values: [...Object.keys(systems)],
        defaultValue: "hilbertCurve"
    }, {
        label: "running sum",
        name: "runningSum",
        type: "checkbox",
        defaultValue: false
    }]
};

export default lindenmayer;
