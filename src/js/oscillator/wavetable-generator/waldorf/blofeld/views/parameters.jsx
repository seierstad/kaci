import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";
import {SYSEX} from "wavetables";

const {
    WALDORF: {
        BLOFELD = {}
    } = {}
} = SYSEX;


const byKey = ([aKey], [bKey]) => aKey < bKey ? -1 : 1;

class BlofeldParameters extends Component {

    static propTypes = {
        "handlers": PropTypes.object.isRequired,
        "patch": PropTypes.object.isRequired,
        "viewState": PropTypes.object.isRequired
    }

    @autobind
    handleDeviceId (event) {
        event.stopPropagation();
        this.props.handlers.waldorf.blofeld.changeDeviceID(parseInt(event.target.value, 10), this.props.patch);
    }

    @autobind
    handleSlotChange (event) {
        event.stopPropagation();
        this.props.handlers.waldorf.blofeld.changeSlot(parseInt(event.target.value, 10), this.props.patch);
    }

    @autobind
    handleName (event) {
        event.stopPropagation();
        this.props.handlers.waldorf.blofeld.changeName(event.target.value, this.props.patch);
    }

    render () {
        const {
            viewState: {
                name = BLOFELD.DEFAULT.NAME,
                slot = BLOFELD.DEFAULT.SLOT,
                deviceId = BLOFELD.DEFAULT.DEVICE_ID
            }
        } = this.props;

        return (
            <fieldset>
                <legend>Waldorf Blofeld parameters</legend>
                <label>
                    <span className="label-text">Wavetable name</span>
                    <input maxLength="14" onChange={this.handleName} pattern="[\x20-\x7F]*" placeholder={BLOFELD.DEFAULT.NAME} value={name} />
                </label>
                <label>
                    <span className="label-text">Wavetable slot</span>
                    <input max={BLOFELD.PARAMETER.SLOT.MAX} min={BLOFELD.PARAMETER.SLOT.MIN} onChange={this.handleSlotChange} placeholder={BLOFELD.DEFAULT.SLOT} type="number" value={slot} />
                </label>
                <label>
                    <span className="label-text">Device ID</span>
                    <select onChange={this.handleDeviceId} value={deviceId}>
                        {Object.entries(BLOFELD.PARAMETER.DEVICE_ID).sort(byKey).map(([key, value]) => <option key={key} value={value}>{key}</option>)}
                    </select>
                </label>
            </fieldset>
        );
    }
}

export default BlofeldParameters;

