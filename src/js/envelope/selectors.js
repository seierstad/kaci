import createCachedSelector from "re-reselect";

const getEnvPatch = (state) => state.patch.envelopes;
const getEnvViewState = state => state.viewState.envelopes;
const getDefaultPatch = state => state.settings.modulation.source.envelope.default;
const getDefaultViewState = state => state.settings.modulation.source.envelope.defaultState;

const getIndex = (_, props) => props.index;
const getKey = (_, {module = "", index = "", part = ""}) => "" + module + index + part;

const getEnvPatchByIndex = createCachedSelector(
    [getEnvPatch, getIndex, getDefaultPatch],
    (patch, index, defaultPatch) => patch[index] || defaultPatch
)(getIndex);


const getDataByKey = (datatype) => (state, props) => {
    const {module, index = null, part = null, subIndex = null} = props;

    const {
        [datatype]: {
            [module]: moduleMatch
        } = {}
    } = state;

    const {
        [index]: indexMatch,
        [part]: partMatch
    } = moduleMatch;

    if (partMatch) {
        const {
            [subIndex]: subIndexPartMatch
        } = partMatch;

        if (subIndexPartMatch) {
            return subIndexPartMatch;
        }
        return partMatch;
    }

    if (indexMatch) {
        const {
            [part]: partIndexMatch
        } = indexMatch;

        if (partIndexMatch) {
            const {
                [subIndex]: subIndexPartIndexMatch
            } = partMatch;

            if (subIndexPartIndexMatch) {
                return subIndexPartIndexMatch;
            }
            return partIndexMatch;
        }

        return indexMatch;
    }

    return moduleMatch;
};

const getPatchByKey = getDataByKey("patch");
const getViewStateByKey = getDataByKey("viewState");

const getEnvViewStateByIndex = createCachedSelector(
    [getEnvViewState, getIndex, getDefaultViewState],
    (viewState, index, defaultViewState) => viewState[index] || defaultViewState
)(getIndex);

const getEnvelopeCached = createCachedSelector(
    [getPatchByKey, getViewStateByKey],
    (patch, viewState) => ({
        ...patch,
        steps: patch.steps.map(([x, y], index, arr) => ({
            x,
            y,
            index,
            first: index === 0,
            last: (index === arr.length - 1),
            active: (viewState && viewState.indexOf(index) !== -1)
        }))
    })
)(getKey);


const getSustainEnvelopeByIndex = createCachedSelector(
    [getEnvPatchByIndex, getEnvViewStateByIndex],
    (patch, viewState) => {
        const isSusActive = !!viewState.editSustain;
        return {
            ...patch,
            "attack": {
                ...patch.attack,
                steps: patch.attack.steps.map(([x, y], index, arr) => ({
                    x,
                    y,
                    index,
                    first: index === 0,
                    last: (index === arr.length - 1),
                    active: (viewState.attack && viewState.attack.indexOf(index) !== -1) || (isSusActive && index === arr.lengt - 1)
                }))
            },
            "release": {
                ...patch.release,
                steps: patch.release.steps.map(([x, y], index, arr) => ({
                    x,
                    y,
                    index,
                    first: index === 0,
                    last: (index === arr.length - 1),
                    active: (viewState.release && viewState.release.indexOf(index) !== -1) || (isSusActive && index === 0)
                }))
            },
            "sustain": {
                active: isSusActive,
                value: patch.release.steps[0][1]
            }
        };
    }
)(getIndex);

export {
    getEnvelopeCached,
    getSustainEnvelopeByIndex
};
