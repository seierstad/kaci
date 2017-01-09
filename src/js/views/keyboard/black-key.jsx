import React from "react";

import * as PropDefs from "../../propdefs";

import Key from "./key.jsx";


class BlackKey extends Key {
    render () {
        const {x, keyWidth, noteName, playState} = this.props;
        return (
            <rect
                className={"key " + noteName + (playState && playState.down ? " down" : "")}
                height="60%"
                onMouseDown={this.handleKeyDown}
                onMouseUp={this.handleKeyUp}
                width={(keyWidth * 0.7) + "%"}
                x={x}
                y="0"
            />
        );
    }
}
BlackKey.propTypes = PropDefs.keyViewPropsShape;


export default BlackKey;
