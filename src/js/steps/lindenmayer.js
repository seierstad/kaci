const hilbertCurve = {
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

const systems = {
    hilbertCurve,
    thueMorseSequence
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
        minValue: 1,
        maxValue: Number.MAX_SAFE_INTEGER,
        defaultValue: 4
    }, {
        label: "system",
        name: "systemName",
        type: "enumeration",
        values: [...Object.keys(systems)],
        defaultValue: "hilbertCurve"
    }]
};

export default lindenmayer;
