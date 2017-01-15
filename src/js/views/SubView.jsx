import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import {modulationTargetShape, subPatchDataShape} from "../propdefs";
import {SUB_TOGGLE, SUB_PAN_CHANGE, SUB_GAIN_CHANGE, SUB_DEPTH_CHANGE} from "../actions";


import RangeInput from "./RangeInput.jsx";

class SubViewPresentation extends Component {
    constructor () {
        super();
        this.handleChangeDepth = this.handleChangeDepth.bind(this);
    }

    handleChangeDepth (event) {
        event.stopPropagation();
        this.props.handlers.depthChange(parseInt(event.target.value));
    }

    render () {
        const {patch, configuration, handlers} = this.props;
        const {panInput, gainInput, toggle, depthChange} = handlers;


        return (
            <section className="sub-view">
                <h1>Sub oscillator</h1>
                <input
                    checked={patch.active}
                    onChange={toggle}
                    type="checkbox"
                />
                <RangeInput
                    changeHandler={gainInput}
                    label="Sub gain"
                    max={configuration.gain.max}
                    min={configuration.gain.min}
                    step={0.01}
                    value={patch.gain}
                />
                <RangeInput
                    changeHandler={panInput}
                    label="Sub pan"
                    max={configuration.pan.max}
                    min={configuration.pan.min}
                    step={0.01}
                    value={patch.pan}
                />
                <fieldset>
                    <legend>Sub depth</legend>
                    <input
                        checked={patch.depth === 0}
                        id="sub-0"
                        name="sub-depth-selector"
                        onChange={this.handleChangeDepth}
                        type="radio"
                        value={0}
                    />
                    <input
                        checked={patch.depth === -1}
                        id="sub-1"
                        name="sub-depth-selector"
                        onChange={this.handleChangeDepth}
                        type="radio"
                        value={-1}
                    />
                    <input
                        checked={patch.depth === -2}
                        id="sub-2"
                        name="sub-depth-selector"
                        onChange={this.handleChangeDepth}
                        type="radio"
                        value={-2}
                    />
                </fieldset>
            </section>
        );
    }
}
SubViewPresentation.propTypes = {
    "configuration": modulationTargetShape.isRequired,
    "handlers": PropTypes.object,
    "patch": subPatchDataShape.isRequired
};
const mapState = (state) => ({
    "configuration": state.settings.modulation.target.sub,
    "patch": state.patch.sub
});
const mapDispatch = (dispatch) => ({
    "handlers": {
        "toggle": () => {dispatch({type: SUB_TOGGLE});},
        "panInput": (value) => {dispatch({type: SUB_PAN_CHANGE, value});},
        "gainInput": (value) => {dispatch({type: SUB_GAIN_CHANGE, value});},
        "depthChange": (value) => {dispatch({type: SUB_DEPTH_CHANGE, value});}
    }
});
const SubView = connect(mapState, mapDispatch)(SubViewPresentation);


export default SubView;
