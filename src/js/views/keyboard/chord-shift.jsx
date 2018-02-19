import React, {Component} from "react";
import PropTypes from "prop-types";

import {chordShiftShape} from "../../propdefs";

import Keys from "./keys.jsx";


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
                {chords.map((chord, index) => <Keys key={index + "-" + Object.keys(chord).join("-")} keys={chord} />)}
            </section>
        );
    }

}


export default ChordShift;
