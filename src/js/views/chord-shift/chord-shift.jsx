import React, {Component} from "react";
import PropTypes from "prop-types";

import {chordShiftShape} from "../../propdefs";

import Chords from "./chords.jsx";
import Keys from "./keys.jsx";

class ChordShift extends Component {

    static propTypes = {
        "chordShift": chordShiftShape.isRequired
    }

    render () {
        const {
            chordShift: {
                activeKeys = {},
                chords = []
            } = {},
            keyHandlers
        } = this.props;

        return (
            <section className="chord-shift">
                <Chords activeKeys={activeKeys} chords={chords} keyHandlers={keyHandlers} />
            </section>
        );
    }

}


export default ChordShift;
