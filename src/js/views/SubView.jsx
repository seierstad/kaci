import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import {modulationTargetShape, subPatchDataShape} from "../propdefs";
import {SUB_GAIN_CHANGE, SUB_PAN_CHANGE, SUB_TOGGLE, SUB_DEPTH_CHANGE, SUB_BEAT_FREQUENCY_CHANGE, SUB_DETUNE_CHANGE, SUB_DETUNE_MODE_CHANGE} from "../actions";
import {defaultSyncConfiguration} from "../configuration";

import SyncControls from "./SyncControls.jsx";
import RangeInput from "./RangeInput.jsx";


class SubViewPresentation extends Component {
    constructor () {
        super();
        this.handleChangeDepth = this.handleChangeDepth.bind(this);
        this.handleDetuneModeChange = this.handleDetuneModeChange.bind(this);
    }

    handleChangeDepth (event) {
        event.stopPropagation();
        this.props.handlers.depthChange(parseInt(event.target.value, 10));
    }
    handleDetuneModeChange (event) {
        event.stopPropagation();
        this.props.handlers.detuneMode(event.target.value);
    }

    render () {
        const {patch, configuration, handlers, syncHandlers} = this.props;
        const {panInput, gainInput, toggle, depthChange, beatToggle, beatChange, detuneChange} = handlers;


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
                    configuration={configuration.gain}
                    label="Sub gain"
                    value={patch.gain}
                />
                <RangeInput
                    changeHandler={panInput}
                    configuration={configuration.pan}
                    label="Sub pan"
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
                <fieldset>
                    <legend>detune</legend>
                    <input
                        checked={patch.detune.mode === "detune"}
                        id="sub-detune-mode-detune"
                        name="sub-detune-mode"
                        onChange={this.handleDetuneModeChange}
                        type="radio"
                        value="detune"
                    />
                    <label htmlFor="sub-detune-mode-detune">detune</label>
                    <input
                        checked={patch.detune.mode === "beat"}
                        id="sub-detune-mode-beat"
                        name="sub-detune-mode"
                        onChange={this.handleDetuneModeChange}
                        type="radio"
                        value="beat"
                    />
                    <label htmlFor="sub-detune-mode-beat">beat</label>
                    {patch.detune.mode === "beat" ?
                        <div className="sub-beat-settings">
                            <RangeInput
                                changeHandler={beatChange}
                                configuration={configuration.beat}
                                label="freq."
                                value={patch.detune.beat}
                            />
                            <SyncControls
                                configuration={defaultSyncConfiguration}
                                handlers={syncHandlers}
                                module="sub"
                                patch={patch.detune.sync}
                            />
                        </div>
                    :
                        <RangeInput
                            changeHandler={detuneChange}
                            configuration={configuration.detune}
                            label="semitone"
                            value={patch.detune.semitone}
                        />
                    }
                </fieldset>
            </section>
        );
    }
}
SubViewPresentation.propTypes = {
    "configuration": modulationTargetShape.isRequired,
    "handlers": PropTypes.object,
    "patch": subPatchDataShape.isRequired,
    "syncHandlers": PropTypes.objectOf(PropTypes.func).isRequired
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
        "depthChange": (value) => {dispatch({type: SUB_DEPTH_CHANGE, value});},
        "detuneChange": (value) => {dispatch({type: SUB_DETUNE_CHANGE, value});},
        "beatChange": (value) => {dispatch({type: SUB_BEAT_FREQUENCY_CHANGE, value});},
        "detuneMode": (value) => {dispatch({type: SUB_DETUNE_MODE_CHANGE, value});}

    }
});
const SubView = connect(mapState, mapDispatch)(SubViewPresentation);


export default SubView;
