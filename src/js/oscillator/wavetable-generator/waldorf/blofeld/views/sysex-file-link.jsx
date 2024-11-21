import React, {Component} from "react";
import PropTypes from "prop-types";
import {SYSEX} from "wavetables";

const {
    WALDORF: {
        BLOFELD = {}
    }
} = SYSEX;


class WaldorfBlofeldSysexLink extends Component {

    static propTypes = {
        "deviceId": PropTypes.number,
        "name": PropTypes.string,
        "slot": PropTypes.number,
        "wavetable": PropTypes.arrayOf(PropTypes.object).isRequired
    }

    render () {
        const {
            deviceId = BLOFELD.DEFAULT.DEVICE_ID,
            name = BLOFELD.DEFAULT.NAME,
            slot = BLOFELD.DEFAULT.SLOT,
            wavetable
        } = this.props;

        return (
            <a download={`${name}-${slot}.syx`} href={BLOFELD.waldorfBlofeldSysexBlob(wavetable, name, slot, deviceId)}>Download Waldorf Blofeld sysex</a>
        );
    }
}

export default WaldorfBlofeldSysexLink;
