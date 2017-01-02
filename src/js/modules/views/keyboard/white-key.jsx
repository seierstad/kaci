import React from "react";

import * as PropDefs from "../../../proptype-defs";

import Key from "./key.jsx";


class WhiteKey extends Key {
    render () {
        const {x, keyWidth, noteName, playState} = this.props;
        return (
            <rect
                className={"key " + noteName + (playState && playState.down ? " down" : "")}
                height="100%"
                onMouseDown={this.handleKeyDown}
                onMouseUp={this.handleKeyUp}
                width={keyWidth + "%"}
                x={x}
                y="0"
            />
        );
    }
}
WhiteKey.propTypes = PropDefs.keyViewProps;


export default WhiteKey;
