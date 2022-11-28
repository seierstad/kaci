import React, {Component} from "react";
import PropTypes from "prop-types";
import { encodeWAV } from "wav-recorder-node";

import * as DEFAULTS from "../defaults.js";
import { waldorfBlofeldWavetable } from "../functions.js";
import { flattenWavetable } from "../../../functions.js";


const waldorfBlofeldSysexBlob = (wavetable, name, slot, deviceId) => URL.createObjectURL(
    new Blob(
        [waldorfBlofeldWavetable(null, flattenWavetable(wavetable), name, slot, deviceId)],
        {type: "application/midi"}
    )
);


class WaldorfBlofeldSysexLink extends Component {

    static propTypes = {
        "deviceId": PropTypes.number,
        "name": PropTypes.string,
        "slot": PropTypes.number,
        "wavetable": PropTypes.arrayOf(PropTypes.object).isRequired
    }

    render () {
        const {
            deviceId = DEFAULTS.DEVICE_ID,
            name = DEFAULTS.NAME,
            slot = DEFAULTS.SLOT,
            wavetable
        } = this.props;

        return (
            <a download={`${name}-${slot}.syx`} href={waldorfBlofeldSysexBlob(wavetable, name, slot, deviceId)}>Download Waldorf Blofeld sysex</a>
        );
    }
}

export default WaldorfBlofeldSysexLink;
