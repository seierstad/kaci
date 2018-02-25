import React, {Component} from "react";
import PropTypes from "prop-types";

import {chordShape} from "../../propdefs";

import Keys from "./keys.jsx";


class Chords extends Component {

    static propTypes = {
        "chords": PropTypes.arrayOf(chordShape).isRequired
    }

    render () {
        const {
            chords = []
        } = this.props;

        return (
            <React.Fragment>
                {chords.map((chord, index) => <Keys key={index + "-" + Object.keys(chord).join("-")} keys={chord} />)}
            </React.Fragment>
        );
    }

}


export default Chords;
