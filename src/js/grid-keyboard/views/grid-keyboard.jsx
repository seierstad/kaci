import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {playStateShape} from "../../play-state/propdefs";
import * as GRID_KEYBOARD from "../actions";


import GridKeys from "./grid-keys.jsx";


class GridKeyboardView extends Component {

    static propTypes = {
        "configuration": PropTypes.object.isRequired,
        "keyHandlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "playState": playStateShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.playState !== nextProps.playState);
    }

    render () {
        const {keyHandlers, playState, configuration} = this.props;
        const {maxX, minX, maxY, minY} = configuration;

        return (
            <section className="controller grid-keyboard">
                <GridKeys
                    keyHandlers={keyHandlers}
                    keys={playState.keys}
                    maxX={maxX}
                    maxY={maxY}
                    minX={minX}
                    minY={minY}
                />
            </section>
        );
    }
}


const mapState = (state) => ({
    "configuration": state.settings.gridKeyboard,
    "playState": state.playState
});
const mapDispatch = (dispatch) => ({
    "keyHandlers": {
        "down": (keyX, keyY) => {dispatch({"type": GRID_KEYBOARD.KEY_DOWN, keyX, keyY});},
        "up": (keyX, keyY) => {dispatch({"type": GRID_KEYBOARD.KEY_UP, keyX, keyY});}
    }
});
const GridKeyboardViewConnected = connect(mapState, mapDispatch)(GridKeyboardView);


export {
    GridKeyboardView
};

export default GridKeyboardViewConnected;
