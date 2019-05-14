import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import autobind from "autobind-decorator";

import {modulationTargetShape} from "../../modulation/propdefs";
//import * as OUTPUT from "../../output-stage/actions";
import {defaultSyncConfiguration} from "../../speed/sync/defaults";
import OutputStage from "../../output-stage/views/output-stage.jsx";
import SyncControls from "../../speed/sync/views/sync-controls.jsx";
import RangeInput from "../../static-source/views/range-input.jsx";
import {subPatchShape} from "../propdefs";
//import * as SUB from "../actions";


class SubViewPresentation extends Component {

    static propTypes = {
        "configuration": modulationTargetShape.isRequired,
        "handlers": PropTypes.object,
        "patch": subPatchShape.isRequired
    }

    @autobind
    handleChangeDepth (event) {
        event.stopPropagation();
        this.props.handlers.depthChange(parseInt(event.target.value, 10));
    }

    @autobind
    handleDetuneModeChange (event) {
        event.stopPropagation();
        this.props.handlers.detuneModeChange(event.target.value);
    }

    @autobind
    handleDetuneSemitoneChange (event) {
        event.stopPropagation();
        this.props.handlers.detuneChange(parseFloat(event.target.value));
    }

    render () {
        const {patch, configuration, handlers} = this.props;
        const {outputStageHandlers, detuneChange} = handlers;

        return (
            <section className="sub-view">
                <h1>Sub oscillator</h1>
                <OutputStage
                    configuration={configuration}
                    handlers={outputStageHandlers}
                    patch={patch}
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
                        checked={patch.mode === "semitone"}
                        id="sub-detune-mode-detune"
                        name="sub-detune-mode"
                        onChange={this.handleDetuneModeChange}
                        type="radio"
                        value="semitone"
                    />
                    <label htmlFor="sub-detune-mode-detune">semitone</label>
                    <input
                        checked={patch.mode === "beat"}
                        id="sub-detune-mode-beat"
                        name="sub-detune-mode"
                        onChange={this.handleDetuneModeChange}
                        type="radio"
                        value="beat"
                    />
                    <label htmlFor="sub-detune-mode-beat">beat</label>
                    {patch.mode === "beat" ?
                        <div className="sub-beat-settings">
                            <RangeInput
                                changeHandler={handlers.beat.frequencyChange}
                                configuration={configuration.beat}
                                label="freq."
                                value={patch.beat.frequency}
                            />
                            <SyncControls
                                configuration={defaultSyncConfiguration}
                                handlers={handlers.beat.sync}
                                module="sub"
                                patch={patch.beat.sync}
                            />
                        </div>
                        :
                        <RangeInput
                            changeHandler={detuneChange}
                            configuration={configuration.detune}
                            label="offset"
                            value={patch.detune}
                        />
                    }
                </fieldset>
            </section>
        );
    }
}


const mapState = (state) => ({
    "configuration": state.settings.modulation.target.sub,
    "patch": state.patch.sub
});

const SubView = connect(mapState, null)(SubViewPresentation);


export default SubView;
