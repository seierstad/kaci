import React, {Component} from "react";
import RangeInput from "./RangeInput.jsx";
import { connect } from "react-redux";
import * as Actions from "../Actions.jsx";

class SubViewPresentation extends Component {
    render () {
        const { patch, settings, onPanInput, onGainInput, onToggle, onDepthChange } = this.props;

        return (
            <section className="sub-view">
                <h1>Sub oscillator</h1>
                <input type="checkbox" onChange={onToggle} checked={patch.active} />
                <RangeInput 
                    label="Sub gain" 
                    min={settings.gain.min}
                    max={settings.gain.max}
                    step={0.01}
                    onChange={onGainInput}
                    onInput={onGainInput}
                    value={patch.gain} />
                <RangeInput 
                    label="Sub pan" 
                    min={settings.pan.min}
                    max={settings.pan.max}
                    step={0.01}
                    onChange={onPanInput}
                    onInput={onPanInput}
                    value={patch.pan} />
                <fieldset>
                    <legend>Sub depth</legend>
                    <input type="radio" name="sub-depth-selector" onChange={onDepthChange} value={0} id="sub-0" defaultChecked={patch.depth === 0} />
                    <input type="radio" name="sub-depth-selector" onChange={onDepthChange} value={-1} id="sub-0" defaultChecked={patch.depth === -1} />
                    <input type="radio" name="sub-depth-selector" onChange={onDepthChange} value={-2} id="sub-0" defaultChecked={patch.depth === -2} />
                </fieldset>
            </section>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        patch: state.patch.sub,
        settings: state.settings.modulation.target.sub
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        onToggle: (event) => {
            dispatch({
                type: Actions.SUB_TOGGLE
            })
        },
        onPanInput: (event) => {
            const value = parseFloat(event.target.value);
            dispatch({
                type: Actions.SUB_PAN_CHANGE,
                value
            })
        },
        onGainInput: (event) => {
            const value = parseFloat(event.target.value);
            dispatch({
                type: Actions.SUB_GAIN_CHANGE,
                value
            })
        },
        onDepthChange: (event) => {
            const value = parseInt(event.target.value, 10);
            dispatch({
                type: Actions.SUB_DEPTH_CHANGE,
                value
            })
        }
    };
};

const SubView = connect(
    mapStateToProps,
    mapDispatchToProps
)(SubViewPresentation);

export default SubView;
