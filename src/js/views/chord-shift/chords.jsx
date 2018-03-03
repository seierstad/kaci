import React, {Component} from "react";
import PropTypes from "prop-types";

import {chordShape} from "../../propdefs";

import Keys from "../keyboard/keys.jsx";


class Chords extends Component {

    static propTypes = {
        "activeKeys": chordShape,
        "chords": PropTypes.arrayOf(chordShape).isRequired,
        "handlers": PropTypes.objectOf(PropTypes.func)
    }

    render () {
        const {
            activeKeys,
            chords = [],
            handlers
        } = this.props;

        return (
            <React.Fragment>
                {chords.map((chord, index) => <Keys handlers={handlers} key={index + "-" + Object.keys(chord).join("-")} keys={chord} />)}
                {activeKeys ? (
                    <Keys key="activeKeys" keys={activeKeys} />
                ): null}
            </React.Fragment>
        );
    }

}


export default Chords;
