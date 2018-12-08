import React, {Component} from "react";
import PropTypes from "prop-types";

import {NOTE_NAMES} from "../../constants";
import {chordShiftPlayStateShape} from "../../chord-shift/propdefs";
import {keyStateShape} from "../propdefs";
import {keyboard as configuration} from "../configuration";

import Key from "./key.jsx";

const findKey = (chord, keyNumber) => chord.find(key => key.number === keyNumber);


class Keys extends Component {

    static propTypes = {
        "chordShift": chordShiftPlayStateShape,
        "endKey": PropTypes.number,
        "keyHandlers": PropTypes.objectOf(PropTypes.func),
        "keys": PropTypes.objectOf(keyStateShape).isRequired,
        "startKey": PropTypes.number
    }

    render () {
        const {
            startKey = configuration.startKey,
            endKey = configuration.endKey,
            keyHandlers,
            keys,
            chordShift = {}
        } = this.props;
        const {
            CSenabled = false,
            CSchords = [],
            CSvalue = 0,
            CSactiveKeys = []
        } = chordShift;

        const whiteKeys = [];
        const blackKeys = [];

        for (let i = startKey; i <= endKey; i += 1) {
            const k = i % 12;
            const black = (k === 1 || k === 3 || k === 6 || k === 8 || k === 10);
            const noteName = NOTE_NAMES[i % 12];

            const findChordIndexes = (chords) => chords.reduce(
                (acc, chord, index) => {
                    if (findKey(chord, i)) {
                        return [...acc, index];
                    }
                    return acc;
                },
                []
            );

            const q = CSvalue * (CSchords.length - 1);
            const chordIndex = Math.floor(q);
            const chordRatio = Math.floor((q - chordIndex) * 100);

            const key = (
                <Key
                    chordRatio={CSenabled ? chordRatio : null}
                    chordShiftActiveKey={CSenabled ? !!findKey(CSactiveKeys, i) : null}
                    chordShiftChordCount={CSenabled ? CSchords.length : null}
                    handlers={keyHandlers}
                    highChordIndex={CSenabled && CSchords.length > chordIndex + 1 ? chordIndex + 1 : null}
                    inChordShiftChords={CSenabled ? findChordIndexes(CSchords) : null}
                    key={i + "-" + noteName}
                    lowChordIndex={CSenabled ? chordIndex : null}
                    name={noteName}
                    number={i}
                    state={keys[i]}
                    wrap={black}
                />
            );

            if (black) {
                blackKeys.push(key);
            } else {
                whiteKeys.push(key);
            }

        }


        return (
            <fieldset className={"keys " + " start-" + NOTE_NAMES[startKey % 12] + " end-" + NOTE_NAMES[endKey % 12]}>
                <legend className="keys-legend">keys</legend>
                <div className="keys-wrapper">
                    <div className="white-keys">
                        {whiteKeys}
                    </div>
                    <div className="black-keys">
                        {blackKeys}
                    </div>
                </div>
            </fieldset>
        );
    }
}


export default Keys;
