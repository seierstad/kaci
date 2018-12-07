import React, {Component} from "react"; import PropTypes from "prop-types";
import {connect} from "react-redux";

import Envelopes from "../envelope/view/envelopes.jsx";
import envelopeHandlers from "../envelope/dispatchers";

import * as Actions from "../actions";
import {patchShape, viewStateShape, configurationShape} from "../propdefs";

import NoiseView from "./NoiseView.jsx";
import SubView from "./SubView.jsx";
import LFOs from "./lfo/lfos.jsx";
import StepSequencers from "./step-sequencer/step-sequencers.jsx";
import MorseGenerators from "./morse/morse-generators.jsx";
import ModulationMatrix from "./modulation/matrix.jsx";
import Oscillator from "./oscillator/oscillator.jsx";
import MainOutput from "./main-output.jsx";

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
                    patch={patch.envelopes}
                    viewState={viewState.envelopes}
                />
                <LFOs
                    configuration={source.lfo}
                    handlers={{...handlers.modulator, ...handlers.periodic, ...handlers.lfo}}
                    patch={patch.lfos}
                />
                <StepSequencers
                    configuration={source.steps}
                    handlers={{...handlers.modulator, ...handlers.periodic, ...handlers.steps}}
                    patch={patch.steps}
                />
                <MorseGenerators
                    configuration={source.morse}
                    handlers={{...handlers.modulator, ...handlers.periodic, ...handlers.morse}}
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
        "modulator": {
            "reset": (event, module, index) => {
                dispatch({"type": Actions.MODULATOR_RESET, module, index});
            },
            "amountChange": (value, module, index) => {
                dispatch({"type": Actions.MODULATOR_AMOUNT_CHANGE, index, module, value});
            },
            "modeChange": (value, module, index) => {
                dispatch({"type": Actions.MODULATOR_MODE_CHANGE, value, module, index});
            }
        },
        "lfo": {
            "changeWaveform": (value, module, index) => {
                dispatch({"type": Actions.LFO_WAVEFORM_CHANGE, index, module, value});
            }
        },
        "steps": {
            "addStep": (index) => {
                dispatch({"type": Actions.STEPS.STEP_ADD, index});
            },
            "deleteStep": (index, step) => {
                dispatch({"type": Actions.STEPS.STEP_DELETE, index, step});
            },
            "stepValueChange": (index, step, value) => {
                dispatch({"type": Actions.STEPS.STEP_VALUE_CHANGE, index, step, value});
            },
            "stepGlideToggle": (index, step) => {
                dispatch({"type": Actions.STEPS.STEP_GLIDE_TOGGLE, index, step});
            },
            "increaseLevelCount": (index) => {
                dispatch({"type": Actions.STEPS.LEVELS_COUNT_INCREASE, index});
            },
            "decreaseLevelCount": (index) => {
                dispatch({"type": Actions.STEPS.LEVELS_COUNT_DECREASE, index});
            },
            "changeGlide": (index, value) => dispatch({"type": Actions.STEPS.GLIDE_TIME_CHANGE, index, value})
        },
        "morse": {
            "speedUnitChange": (module, index, value) => {
                dispatch({"type": Actions.MORSE_SPEED_UNIT_CHANGE, module, index, value});
            },
            "paddingChange": (module, index, value) => {
                dispatch({"type": Actions.MORSE_PADDING_CHANGE, module, index, value});
            },
            "shiftChange": (module, index, value) => {
                dispatch({"type": Actions.MORSE_SHIFT_CHANGE, module, index, value});
            },
            "toggleFillToFit": (module, index, value) => {
                dispatch({"type": Actions.MORSE_FILL_TOGGLE, module, index, value});
            },
            "textChange": (module, index, value) => {
                dispatch({"type": Actions.MORSE_TEXT_CHANGE, module, index, value});
            },
            "toggleGuide": (module, index, value) => {
                dispatch({"type": Actions.MORSE_GUIDE_TOGGLE, module, index, value});
            }
        },
        "periodic": {
            "frequencyChange": (value, module, index) => {
                dispatch({"type": Actions.MODULATOR_FREQUENCY_CHANGE, index, module, value});
            },
            "sync": {
                "denominatorChange": (value, module, index) => {
                    dispatch({"type": Actions.SYNC_DENOMINATOR_CHANGE, module, index, value});
                },
                "numeratorChange": (value, module, index) => {
                    dispatch({"type": Actions.SYNC_NUMERATOR_CHANGE, module, index, value});
                },
                "toggle": (module, index) => {
                    dispatch({"type": Actions.SYNC_TOGGLE, module, index});
                }
            }
        },
        "noise": {
            "outputHandlers": {
                "handleToggle": () => {
                    dispatch({type: Actions.OUTPUT_TOGGLE, module: "noise"});
                },
                "handlePanInput": (value) => {
                    dispatch({type: Actions.OUTPUT_PAN_CHANGE, value, module: "noise"});
                },
                "handleGainInput": (value) => {
                    dispatch({type: Actions.OUTPUT_GAIN_CHANGE, value, module: "noise"});
                }
            },
            "colorChange": (value) => {
                dispatch({type: Actions.NOISE_COLOR_CHANGE, value});
            }
        },
        "main": {
            "outputHandlers": {
                "handleToggle": () => {
                    dispatch({type: Actions.OUTPUT_TOGGLE, module: "main"});
                },
                "handlePanInput": (value) => {
                    dispatch({type: Actions.OUTPUT_PAN_CHANGE, value, module: "main"});
                },
                "handleGainInput": (value) => {
                    dispatch({type: Actions.OUTPUT_GAIN_CHANGE, value, module: "main"});
                }
            }
        }
    }
});

const Patch = connect(null, mapDispatchToProps)(PatchPresentation);


export default Patch;
