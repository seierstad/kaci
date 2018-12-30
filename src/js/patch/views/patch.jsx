import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {FREQUENCY_CHANGE as MODULATOR_FREQUENCY_CHANGE} from "../../modulator/actions";
import modulatorHandlers from "../../modulator/dispatchers";
import ModulationMatrix from "../../modulation/views/matrix.jsx";
import Envelopes from "../../envelope/view/envelopes.jsx";
import envelopeHandlers from "../../envelope/dispatchers";
import morseHandlers from "../../morse/dispatchers";

import MorseGenerators from "../../morse/views/morse-generators.jsx";
import * as STEPS from "../../steps/actions";
import * as SYNC from "../../sync/actions";
import * as OUTPUT from "../../output-stage/actions";
import * as LFO from "../../lfo/actions";
import * as NOISE from "../../noise/actions";

import {
    viewStateShape,
    configurationShape
} from "../../propdefs";

import NoiseView from "../../noise/views/noise.jsx";
import SubView from "../../sub/views/sub.jsx";
import LFOs from "../../lfo/views/lfos.jsx";
import StepSequencers from "../../steps/views/step-sequencers.jsx";
import Oscillator from "../../oscillator/views/oscillator.jsx";
import MainOutput from "../../main-out/views/main-out.jsx";
import {patchShape} from "../propdefs";


class PatchPresentation extends Component {

    static propTypes = {
        "configuration": configurationShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": patchShape.isRequired,
        "viewState": viewStateShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return nextProps.patch !== this.props.patch
                || nextProps.viewState !== this.props.viewState;
    }

    render () {
        const {configuration, patch, handlers, viewState} = this.props;
        const {target, source} = configuration.modulation;

        return (
            <div>
                <MainOutput
                    configuration={target.main}
                    handlers={handlers.main}
                    patch={patch.main}
                />
                <Oscillator
                    configuration={target.oscillator}
                    envelopeHandlers={handlers.envelope}
                    patch={patch.oscillator}
                    viewState={viewState.oscillator}
                />
                <NoiseView
                    configuration={target.noise}
                    handlers={handlers.noise}
                    patch={patch.noise}
                />
                <SubView
                    configuration={target.sub}
                    handlers={handlers.sub}
                    patch={patch.sub}
                    syncHandlers={handlers.periodic.sync}
                />
                <Envelopes
                    configuration={source.envelope}
                />
                <LFOs
                    configuration={source.lfo}
                    handlers={{
                        ...handlers.modulator,
                        ...handlers.periodic,
                        ...handlers.lfo
                    }}
                    patch={patch.lfos}
                />
                <StepSequencers
                    configuration={source.steps}
                    handlers={{
                        ...handlers.modulator,
                        ...handlers.periodic,
                        ...handlers.steps
                    }}
                    patch={patch.steps}
                />
                <MorseGenerators
                    configuration={source.morse}
                    handlers={{
                        ...handlers.modulator,
                        ...handlers.periodic,
                        ...handlers.morse
                    }}
                    patch={patch.morse}
                    viewState={viewState.morse}
                />
                <ModulationMatrix
                    configuration={configuration.modulation}
                    patch={patch.modulation}
                />
            </div>
        );
    }
}


const mapDispatchToProps = (dispatch) => ({
    "handlers": {
        "envelope": envelopeHandlers(dispatch),
        "modulator": modulatorHandlers(dispatch),
        "lfo": {
            "changeWaveform": (module, index, value) => {
                dispatch({"type": LFO.WAVEFORM_CHANGE, module, index, value});
            }
        },
        "steps": {
            "addStep": (index) => {
                dispatch({"type": STEPS.STEP_ADD, index});
            },
            "deleteStep": (index, step) => {
                dispatch({"type": STEPS.STEP_DELETE, index, step});
            },
            "stepValueChange": (index, step, value) => {
                dispatch({"type": STEPS.STEP_VALUE_CHANGE, index, step, value});
            },
            "stepGlideToggle": (index, step) => {
                dispatch({"type": STEPS.STEP_GLIDE_TOGGLE, index, step});
            },
            "increaseLevelCount": (index) => {
                dispatch({"type": STEPS.LEVELS_COUNT_INCREASE, index});
            },
            "decreaseLevelCount": (index) => {
                dispatch({"type": STEPS.LEVELS_COUNT_DECREASE, index});
            },
            "changeGlide": (index, value) => dispatch({"type": STEPS.GLIDE_TIME_CHANGE, index, value})
        },
        "morse": morseHandlers(dispatch),
        "periodic": {
            "frequencyChange": (value, module, index) => {
                dispatch({"type": MODULATOR_FREQUENCY_CHANGE, index, module, value});
            },
            "sync": {
                "denominatorChange": (value, module, index) => {
                    dispatch({"type": SYNC.DENOMINATOR_CHANGE, module, index, value});
                },
                "numeratorChange": (value, module, index) => {
                    dispatch({"type": SYNC.NUMERATOR_CHANGE, module, index, value});
                },
                "toggle": (module, index) => {
                    dispatch({"type": SYNC.TOGGLE, module, index});
                }
            }
        },
        "noise": {
            "outputHandlers": {
                "handleToggle": () => {
                    dispatch({type: OUTPUT.TOGGLE, module: "noise"});
                },
                "handlePanInput": (value) => {
                    dispatch({type: OUTPUT.PAN_CHANGE, value, module: "noise"});
                },
                "handleGainInput": (value) => {
                    dispatch({type: OUTPUT.GAIN_CHANGE, value, module: "noise"});
                }
            },
            "colorChange": (value) => {
                dispatch({type: NOISE.COLOR_CHANGE, value});
            }
        },
        "main": {
            "outputHandlers": {
                "handleToggle": () => {
                    dispatch({type: OUTPUT.TOGGLE, module: "main"});
                },
                "handlePanInput": (value) => {
                    dispatch({type: OUTPUT.PAN_CHANGE, value, module: "main"});
                },
                "handleGainInput": (value) => {
                    dispatch({type: OUTPUT.GAIN_CHANGE, value, module: "main"});
                }
            }
        }
    }
});

const Patch = connect(null, mapDispatchToProps)(PatchPresentation);


export default Patch;
