import React, {Component} from "react";
import PropTypes from "prop-types";

import {chordShiftShape} from "../../propdefs";

import Chords from "./chords.jsx";


class ChordShift extends Component {

    static propTypes = {
        "chordShift": chordShiftShape.isRequired
    }

    render () {
        const {
            chordShift: {
                chords = []
            } = {}
        } = this.props;

        return (
            <section className="chord-shift">
                <Chords chords={chords} />
            </section>
        );
    }

}


export default ChordShift;
