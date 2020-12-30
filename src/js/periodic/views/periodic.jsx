import React from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import SyncControls from "../../speed/sync/views/sync-controls.jsx";
import RangeInput from "../../static-source/views/range-input.jsx";

const Periodic = Sup => class Periodic extends Sup {

    static propTypes = {
        "discreteTime": PropTypes.bool,
        "handlers": PropTypes.shape({
            "speed": PropTypes.shape({
                "frequencyChange": PropTypes.func.isRequired,
                "sync": PropTypes.objectOf(PropTypes.func).isRequired,
                "speedUnit": PropTypes.number
            }).isRequired
        }),
        "includeSync": PropTypes.bool
    }

    constructor (props) {
        super(props);
    }

    componentDidMount () {
    }

    componentDidUpdate () {
    }

    @autobind
    handleSpeedUnitChange (event) {
        event.stopPropagation();
        const {index, handlers} = this.props;
        const value = parseInt(event.target.value, 10);
        handlers.speed.speedUnitChange(value, index, this.module);
    }

    @autobind
    frequencyChange (value) {
        const {index, handlers} = this.props;
        handlers.speed.frequencyChange(value, index, this.module);
    }

    @autobind
    handleReset (event) {
        const {index, handlers} = this.props;
        handlers.reset(event, index, this.module);
    }

    render () {
        const {
            patch,
            configuration,
            discreteTime,
            index,
            handlers,
            includeSync
        } = this.props;

        return (
            <Sup
                {...this.props}
            >
                <button onClick={this.handleReset}>reset</button>
                <fieldset>
                    <legend>speed</legend>
                    <RangeInput
                        changeHandler={this.frequencyChange}
                        configuration={configuration.speed.frequency}
                        disabled={patch.speed.sync.enabled}
                        label="frequency"
                        value={patch.speed.frequency}
                    />
                    {discreteTime && (
                        <label htmlFor={this.module + "-speed-unit-" + index}>
                            <span className="label-text">Speed unit</span>
                            <input
                                className="speed-reference"
                                id={this.module + "-speed-unit-" + index}
                                max={this.pattern}
                                min={0}
                                onChange={this.handleSpeedUnitChange}
                                onInput={this.handleSpeedUnitChange}
                                step={1}
                                type="number"
                                value={patch.speed.speedUnit || 0}
                            />
                        </label>
                    )}
                    {includeSync ?
                        <SyncControls
                            configuration={configuration.speed.sync}
                            handlers={handlers.speed.sync}
                            index={index}
                            module={this.module}
                            patch={patch.speed.sync}
                        />
                        :
                        null
                    }
                </fieldset>
                {this.props.children}
            </Sup>
        );
    }
};


export default Periodic;
