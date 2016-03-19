import React, {Component} from "react";
import RangeInput from "./RangeInput.jsx";
import { connect } from "react-redux";
import * as Actions from "../Actions.jsx";

class NoiseViewPresentation extends Component {
    render () {
        const { patch, settings, onPanInput, onGainInput, onToggle } = this.props;

        return (
            <section className="noise-view">
                <h1>Noise</h1>
                <input type="checkbox" onChange={onToggle} checked={patch.active} />
                <RangeInput 
                    label="Noise gain" 
                    min={settings.gain.min}
                    max={settings.gain.max}
                    step={0.01}
                    onInput={onGainInput}
                    value={patch.gain} />
                <RangeInput 
                    label="Noise pan" 
                    min={settings.pan.min}
                    max={settings.pan.max}
                    step={0.01}
                    onInput={onPanInput}
                    value={patch.pan} />
            </section>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        patch: state.patch.noise,
        settings: state.settings.modulation.target.noise
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        onToggle: (event) => {
            dispatch({
                type: Actions.NOISE_TOGGLE
            })
        },
        onPanInput: (event) => {
            const value = parseFloat(event.target.value);
            dispatch({
                type: Actions.NOISE_PAN_CHANGE,
                value
            })
        },
        onGainInput: (event) => {
            const value = parseFloat(event.target.value);
            dispatch({
                type: Actions.NOISE_GAIN_CHANGE,
                value
            })
        }
    }
};

const NoiseView = connect(
    mapStateToProps,
    mapDispatchToProps
)(NoiseViewPresentation);

module.exports = NoiseView;