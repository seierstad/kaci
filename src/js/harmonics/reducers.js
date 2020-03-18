import {fourierSeries} from "../waveform/waveforms";

import {
    ADD,
    LEVEL_CHANGE,
    LEVELS_NORMALIZE,
    PHASE_CHANGE,
    REMOVE,
    TOGGLE,
    SERIES,
    MIX_CHANGE
} from "./actions";
import {defaultHarmonicParameters} from "./defaults";

const defaultHarmonics = [{...defaultHarmonicParameters}];

const harmonic = (state = {}, action) => {
    switch (action.type) {
        case LEVELS_NORMALIZE:
        case LEVEL_CHANGE:
            return {
                ...state,
                level: action.value
            };

        case PHASE_CHANGE:
            return {
                ...state,
                phase: action.value
            };

        case TOGGLE:
            return {
                ...state,
                enabled: !state.enabled
            };

    }

    return state;
};

const harmonicsSorter = (a, b) => (a.numerator / a.denominator) < (b.numerator / b.denominator) ? -1 : 1;
const harmonicsMerger = (base, addition) => {
    // takes two sorted arrays of harmonics
    // and adds the harmonics from additionthat are not present in base

    let additionIndex = 0;
    const additionLength = addition.length;
    const result = [];
    if (additionLength === 0) {
        return base;
    }

    for (let baseIndex = 0, l = base.length; baseIndex < l; baseIndex += 1) {
        const baseRatio = base[baseIndex].numerator / base[baseIndex].denominator;
        while ((additionIndex < additionLength) && addition[additionIndex].numerator / addition[additionIndex].denominator < baseRatio) {
            result.push(addition[additionIndex]);
            additionIndex += 1;
        }
        if ((additionIndex < additionLength) && addition[additionIndex].numerator / addition[additionIndex].denominator === baseRatio) {
            additionIndex += 1;
        }
        result.push(base[baseIndex]);
    }
    if (additionIndex < additionLength) {
        return [
            ...result,
            ...addition.slice(additionIndex)
        ];
    }

    return result;
};

const removeCommonZeros = (state) => {
    let unaltered = true;
    const second = [];

    const first = state[0].reduce((acc, curr, index) => {
        if (curr.level === 0 && state[1][index].level === 0) {
            unaltered = false;
            return acc;
        }
        second.push(state[1][index]);
        return [...acc, curr];
    }, []);

    if (unaltered) {
        return state;
    }

    return {
        ...state,
        0: first,
        1: second
    };
};

const harmonics = (state = [...defaultHarmonics], action) => {
    const groupIndex = action.groupIndex || 0;
    const harmonicIndex = state[groupIndex].findIndex(h => h.numerator === action.numerator && h.denominator === action.denominator);
    const {type} = action;

    switch (type) {
        case MIX_CHANGE:
            return {
                ...state,
                mix: action.value
            };

        case LEVELS_NORMALIZE:
            const sum = state[groupIndex].reduce((acc, h) => acc + Math.abs(h.level), 0);

            return {
                ...state,
                [groupIndex]: state[groupIndex].map(h => harmonic(h, {type, value: (h.level / sum)}))
            };

        case LEVEL_CHANGE:
        case PHASE_CHANGE:
            if (typeof groupIndex === "number" && typeof harmonicIndex === "number") {
                return {
                    ...state,
                    [groupIndex]: [
                        ...state[groupIndex].slice(0, harmonicIndex),
                        harmonic(state[groupIndex][harmonicIndex], action),
                        ...state[groupIndex].slice(harmonicIndex + 1)
                    ]
                };
            }
            break;

        case TOGGLE:
            if (typeof harmonicIndex === "number") {
                return {
                    ...state,
                    [0]: [
                        ...state[0].slice(0, harmonicIndex),
                        harmonic(state[0][harmonicIndex], action),
                        ...state[0].slice(harmonicIndex + 1)
                    ],
                    [1]: [
                        ...state[1].slice(0, harmonicIndex),
                        harmonic(state[1][harmonicIndex], action),
                        ...state[1].slice(harmonicIndex + 1)
                    ]
                };
            }
            break;

        case REMOVE:
            if (typeof harmonicIndex === "number") {
                return {
                    ...state,
                    [0]: [
                        ...state[0].slice(0, harmonicIndex),
                        ...state[0].slice(harmonicIndex + 1)
                    ],
                    [1]: [
                        ...state[1].slice(0, harmonicIndex),
                        ...state[1].slice(harmonicIndex + 1)
                    ]
                };
            }
            break;

        case ADD:
            return {
                ...state,
                [0]: [
                    ...state[0],
                    {
                        ...defaultHarmonicParameters,
                        numerator: action.numerator,
                        denominator: action.denominator
                    }
                ].sort(harmonicsSorter),
                [1]: [
                    ...state[1],
                    {
                        ...defaultHarmonicParameters,
                        numerator: action.numerator,
                        denominator: action.denominator
                    }
                ].sort(harmonicsSorter)
            };
        case SERIES:
            if (action.preset) {
                const groupIndex = action.groupIndex || 0;
                const secondary = groupIndex === 0 ? 1 : 0;
                const series = fourierSeries[action.preset](action.partials)
                    .map((level, harmonicIndex) => ({
                        ...defaultHarmonicParameters,
                        level,
                        phase: 0,
                        numerator: harmonicIndex,
                        denominator: 1
                    }))
                    .filter(h => h.level !== 0);

                return removeCommonZeros({
                    ...state,
                    [groupIndex]: harmonicsMerger(series, state[groupIndex].map(h => ({...h, level: 0, phase: 0}))),
                    [secondary]: harmonicsMerger(state[secondary], series.map(h => ({...h, level: 0, phase: 0})))
                });
            }
            break;
    }

    return state;
};

export default harmonics;

