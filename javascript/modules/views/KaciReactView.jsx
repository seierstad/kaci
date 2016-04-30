import React, {Component} from "react";
import { connect } from "react-redux";

import SystemSettingsView from "./SystemSettingsView.jsx";
import NoiseView from "./NoiseView.jsx";
import SubView from "./SubView.jsx";
import Envelopes from "./EnvelopeView.jsx";
import LFOs from "./LFOView.jsx";
import ModulationMatrix from "./ModulationMatrixView.jsx";
import Oscillator from "./OscillatorView.jsx";
import * as Actions from "../Actions.jsx";

import {getOffsetElement, cursorPosition, sizeInPixels, getValuePair} from "./ViewUtils";

class KaciReactViewPresentation extends Component {
//                <Oscillator handlers={handlers.oscillator} envelopeHandlers={handlers.envelope} />
    render () {
        const {configuration, patch, handlers, viewState} = this.props;
        return (
        	<div>
        	    <SystemSettingsView 
                    midiHandlers={handlers.midi} 
                    midiConfiguration={configuration.midi}
                    keyboardConfiguration={configuration.keyboard}
                    keyboardHandlers={handlers.keyboard} />

        	    <NoiseView 
                    patch={patch.noise}
                    handlers={handlers.noise} 
                    configuration={configuration.modulation.target.noise} />
        	    <SubView 
                    patch={patch.sub}
                    handlers={handlers.sub} 
                    configuration={configuration.modulation.target.sub} />
        	    <Envelopes
                    patch={patch.envelopes}
                    handlers={handlers.envelope}
                    configuration={configuration.modulation.source.envelopes}
                    viewState={viewState.envelopes}
                    />
                <LFOs handlers={handlers.lfo} />
                <ModulationMatrix handlers={handlers.modulation} />
        	</div>
        );
    }
}
const mapStateToProps = (state) => ({
    configuration: state.settings,
    patch: state.patch,
    viewState: state.viewState

});
const mapDispatchToProps = (dispatch) => {
    return {
        handlers: {
            midi: {
                portChange: (event) => {
                    const value = event.target.value;
                    dispatch({type: Actions.MIDI_PORT_SELECT, value});
                }
            },
            oscillator: {
                resonanceFactor: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({type: Actions.OSCILLATOR_RESONANCE_FACTOR_CHANGE, value});            
                }
            },
            envelope: {
                circleClick: (event, module, envelopeIndex, envelopePart, index, first, last) => {
                    if (event.shiftKey) {
                        dispatch({
                            type: Actions.ENVELOPE_POINT_DELETE,
                            module,
                            envelopeIndex,
                            envelopePart,
                            index
                        });
                    } else {
                        if ((envelopePart === "sustain") || (envelopePart === "release" && first) || envelopePart === "attack" && last) {
                            dispatch({type: Actions.ENVELOPE_SUSTAIN_EDIT_START, module, envelopeIndex});
                        } else {
                            dispatch({type: Actions.ENVELOPE_POINT_EDIT_START, module, envelopeIndex, envelopePart, index});
                        }
                    }
                },
                mouseOut: (event, module, envelopeIndex, envelopePart) => {
                    const pos = getValuePair(event, event.currentTarget);
                    if (pos.x > 1 || pos.x < 0 || pos.y > 1 || pos.y < 0) {
                        if (envelopePart === "sustain") {
                            dispatch({type: Actions.ENVELOPE_SUSTAIN_EDIT_END, module, envelopeIndex});
                        } else {
                            dispatch({type: Actions.ENVELOPE_BLUR, module, envelopeIndex, envelopePart});
                        }
                    }
                },
                activeCircleMouseUp: (event, module, envelopeIndex, envelopePart, index) => {
                    dispatch({
                        type: Actions.ENVELOPE_POINT_EDIT_END,
                        module,
                        envelopeIndex,
                        envelopePart,
                        index
                    })
                },
                circleBlur: (event, module, envelopeIndex, envelopePart, index, first, last) => {
                    if ((envelopePart === "sustain") || (envelopePart === "release" && first) || envelopePart === "attack" && first) {
                        dispatch({type: Actions.ENVELOPE_SUSTAIN_EDIT_END, module, envelopeIndex});
                    } else {
                        dispatch({type: Actions.ENVELOPE_POINT_EDIT_END, module, envelopeIndex, envelopePart, index});
                    }
                },
                backgroundClick: (event, module, steps, envelopeIndex, envelopePart) => {
                    const {x, y} = getValuePair(event, event.target);
                    const index = steps.findIndex(e => e[0] > x);

                    dispatch({type: Actions.ENVELOPE_POINT_ADD, module, envelopeIndex, envelopePart, index, x, y});
                },
                sustainBackgroundClick: (event, module, envelopeIndex) => {
                    const {x, y} = getValuePair(event, event.target);
                    dispatch({type: Actions.ENVELOPE_SUSTAIN_CHANGE, module, envelopeIndex, value: y});            
                },
                circleMouseDrag: (event, module, envelopeIndex, envelopePart, background, index, first, last) => {
                    const {x, y} = getValuePair(event, background);

                    if ((envelopePart === "sustain") || (envelopePart === "release" && first) || (envelopePart === "attack" && last)) {

                        dispatch({
                            type: Actions.ENVELOPE_SUSTAIN_CHANGE,
                            module,
                            envelopeIndex,
                            envelopePart,
                            value: y
                        });
                    } else {
                        dispatch({type: Actions.ENVELOPE_POINT_CHANGE, module, envelopeIndex, envelopePart, index, x, y});
                    }
                },
                durationChange: (event, module, envelopeIndex, envelopePart) => {
                    dispatch({
                        type: Actions.ENVELOPE_DURATION_CHANGE,
                        module,
                        envelopeIndex,
                        envelopePart,
                        value: parseFloat(event.target.value)
                    })
                }

            },
            lfos: {

            },
            sub: {
                toggle: (event) => {
                    dispatch({type: Actions.SUB_TOGGLE});
                },
                panInput: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({type: Actions.SUB_PAN_CHANGE, value});
                },
                gainInput: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({type: Actions.SUB_GAIN_CHANGE, value});
                },
                depthChange: (event) => {
                    const value = parseInt(event.target.value, 10);
                    dispatch({type: Actions.SUB_DEPTH_CHANGE, value});
                }
            },
            noise: {
                toggle: (event) => {
                    dispatch({type: Actions.NOISE_TOGGLE});
                },
                panInput: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({type: Actions.NOISE_PAN_CHANGE, value});
                },
                gainInput: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({type: Actions.NOISE_GAIN_CHANGE, value});
                }
            },
            modulation: {

            },
            keyboard: {
                layoutChange: (event) => {
                    const value = event.target.value;
                    dispatch({type: Actions.KEYBOARD_LAYOUT_CHANGE, value});
                }
            }
        }
    };
};
const KaciReactView = connect(
    mapStateToProps,
    mapDispatchToProps
)(KaciReactViewPresentation);


export default KaciReactView;
