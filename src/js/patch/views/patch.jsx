import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import modulatorHandlers from "../../modulator/dispatchers";
import ModulationMatrix from "../../modulation/views/matrix.jsx";
import Envelopes from "../../envelope/view/envelopes.jsx";
import envelopeHandlers from "../../envelope/dispatchers";
import lfoHandlers from "../../lfo/dispatchers";
import morseHandlers from "../../morse/dispatchers";
import stepsHandlers from "../../steps/dispatchers";
import subHandlers from "../../sub/dispatchers";
import noiseHandlers from "../../noise/dispatchers";
import oscillatorHandlers from "../../oscillator/dispatchers";


import MorseGenerators from "../../morse/views/morse-generators.jsx";
import * as OUTPUT from "../../output-stage/actions";

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
            <React.Fragment>
                <MainOutput
                    configuration={target.main}
                    handlers={handlers.main}
                    patch={patch.main}
                />
                <div className="sound-sources">
                    <Oscillator
                        configuration={target.oscillator}
                        handlers={handlers.oscillator}
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
                    />
                </div>
                <div className="modulation-sources">
                    <Envelopes
                        configuration={source.envelope}
                    />
                    <LFOs
                        configuration={source.lfo}
                        handlers={handlers.lfo}
                        patch={patch.lfos}
                    />
                    <StepSequencers
                        configuration={source.steps}
                        handlers={handlers.steps}
                        patch={patch.steps}
                        viewState={viewState.steps}
                    />
                    <MorseGenerators
                        configuration={source.morse}
                        handlers={handlers.morse}
                        patch={patch.morse}
                        viewState={viewState.morse}
                    />
                </div>
                <ModulationMatrix
                    configuration={configuration.modulation}
                    patch={patch.modulation}
                />
            </React.Fragment>
        );
    }
}


const mapDispatchToProps = (dispatch) => ({
    "handlers": {
        "oscillator": oscillatorHandlers(dispatch),
        "envelope": envelopeHandlers(dispatch),
        "modulator": modulatorHandlers(dispatch),
        "lfo": lfoHandlers(dispatch),
        "steps": stepsHandlers(dispatch),
        "morse": morseHandlers(dispatch),
        "sub": subHandlers(dispatch),
        "noise": noiseHandlers(dispatch),
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
