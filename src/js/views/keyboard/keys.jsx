import React, {Component, PropTypes} from "react";

import {NOTE_NAMES} from "../../constants";
import {chordShiftShape} from "../../propdefs";

import Key from "./key.jsx";

const findKey = (chord, keyNumber) => chord.find(key => key.number === keyNumber);


class Keys extends Component {

    static propTypes = {
        "chordShift": chordShiftShape.isRequired,
        "endKey": PropTypes.number.isRequired,
        "keys": PropTypes.array.isRequired,
        "startKey": PropTypes.number.isRequired
    }

    render () {
        const {startKey, endKey, keys, chordShift} = this.props;
        const {enabled, chords, value, activeKeys} = chordShift;

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

            const q = value * (chords.length - 1);
            const chordIndex = Math.floor(q);
            const chordRatio = Math.floor((q - chordIndex) * 100);

            const key = (
                <Key
                    chordRatio={chordShift.enabled ? chordRatio : null}
                    chordShiftActiveKey={chordShift.enabled ? !!findKey(chordShift.activeKeys, i) : null}
                    chordShiftChordCount={chordShift.enabled ? chordShift.chords.length : null}
                    highChordIndex={chordShift.enabled && chords.length > chordIndex + 1 ? chordIndex + 1 : null}
                    inChordShiftChords={chordShift.enabled ? findChordIndexes(chordShift.chords) : null}
                    key={i + "-" + noteName}
                    lowChordIndex={chordShift.enabled ? chordIndex : null}
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
