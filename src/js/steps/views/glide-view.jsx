import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import {boundMethod} from "autobind-decorator";

import RangeInput from "../../static-source/views/range-input.jsx";
import {slopes} from "../../sequencer/propdefs";


class GlideView extends PureComponent {

    static propTypes = {
        "configuration": PropTypes.object.isRequired,
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "index": PropTypes.number.isRequired,
        "patch": PropTypes.object.isRequired
    }

    @boundMethod
    handleWithIndex (handler) {
        const {
            index
        } = this.props;

        handler(index);
    }

    @boundMethod
    onGlideTimeChange (value, direction) {
        const {
            index,
            handlers: {
                changeGlideTime
            } = {}
        } = this.props;

        changeGlideTime(index, value, direction);
    }

    @boundMethod
    onRisingGlideTimeChange (value) {
        this.onGlideTimeChange(value, "up");
    }

    @boundMethod
    onFallingGlideTimeChange (value) {
        this.onGlideTimeChange(value, "down");
    }

    @boundMethod
    handleGlideNone () {
        this.handleWithIndex(this.props.handlers.glideNoSteps);
    }

    @boundMethod
    handleGlideEvery () {
        this.handleWithIndex(this.props.handlers.glideAtEvery);
    }

    @boundMethod
    handleGlideRising () {
        this.handleWithIndex(this.props.handlers.glideAtRising);
    }

    @boundMethod
    handleGlideFalling () {
        this.handleWithIndex(this.props.handlers.glideAtFalling);
    }

    @boundMethod
    handleGlideChange () {
        this.handleWithIndex(this.props.handlers.glideAtChange);
    }

    @boundMethod
    shiftHandler (shift) {
        const {
            index,
            handlers: {
                glideShift
            } = {}
        } = this.props;

        glideShift(index, shift);
    }


    @boundMethod
    handleShiftLeft () {
        this.shiftHandler(-1);
    }

    @boundMethod
    handleShiftRight () {
        this.shiftHandler(1);
    }

    @boundMethod
    handleGlideSlope (event, direction) {
        const {value} = event.target;

        const {
            index,
            handlers: {
                changeGlideSlope
            } = {}
        } = this.props;

        changeGlideSlope(index, value, direction);
    }

    @boundMethod
    handleBothGlideSlope (event) {
        this.handleGlideSlope(event, "up");
    }

    @boundMethod
    handleRisingGlideSlope (event) {
        this.handleGlideSlope(event, "up");
    }

    @boundMethod
    handleFallingGlideSlope (event) {
        this.handleGlideSlope(event, "down");
    }

    render () {
        const {configuration, patch} = this.props;

        return (
            <fieldset>
                <legend>glide</legend>
                <label><input type="checkbox" value={!patch.symmetric} /><span className="label-text">rise = fall</span></label>

                <React.Fragment>
                    <fieldset>
                        <legend>rising</legend>
                        <RangeInput
                            changeHandler={this.onRisingGlideTimeChange}
                            configuration={configuration}
                            label="rising time"
                            value={patch.up.time}
                        />
                        <label>
                            <span className="label-text">slope</span>
                            <select onChange={this.handleRisingGlideSlope} value={patch.up.slope}>
                                {slopes.map(slope => (
                                    <option key={slope} value={slope}>{slope}</option>
                                ))}
                            </select>
                        </label>
                    </fieldset>
                    <fieldset>
                        <legend>falling</legend>
                        <RangeInput
                            changeHandler={this.onFallingGlideTimeChange}
                            configuration={configuration}
                            label="falling time"
                            value={patch.down.time}
                        />
                        <label>
                            <span className="label-text">slope</span>
                            <select onChange={this.handleFallingGlideSlope} value={patch.down.slope}>
                                {slopes.map(slope => (
                                    <option key={slope} value={slope}>{slope}</option>
                                ))}
                            </select>
                        </label>
                    </fieldset>
                </React.Fragment>

                <button
                    className="glide-pattern-button none"
                    onClick={this.handleGlideNone}
                    title="all glides off"
                    type="button"
                >none</button>
                <button
                    className="glide-pattern-button rising"
                    onClick={this.handleGlideRising}
                    title="glide on rising value"
                    type="button"
                >rising</button>
                <button
                    className="glide-pattern-button falling"
                    onClick={this.handleGlideFalling}
                    title="glide on falling value"
                    type="button"
                >falling</button>
                <button
                    className="glide-pattern-button change"
                    onClick={this.handleGlideChange}
                    title="glide on changing value"
                    type="button"
                >change</button>
                <button
                    className="glide-pattern-button every"
                    onClick={this.handleGlideEvery}
                    title="glide every step"
                    type="button"
                >every</button>
                <button
                    className="glide-pattern-button shift left"
                    onClick={this.handleShiftLeft}
                    title="shift glides left"
                    type="button"
                >◀</button>
                <button
                    className="glide-pattern-button shift right"
                    onClick={this.handleShiftRight}
                    title="shift glides right"
                    type="button"
                >▶</button>
            </fieldset>
        );
    }
}

export default GlideView;
