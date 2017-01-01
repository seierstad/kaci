import React, {Component, PropTypes} from "react";

import * as PropDefs from "../../proptype-defs";

import EnvelopeLines from "./envelope-lines.jsx";
import EnvelopeCircles from "./envelope-circles.jsx";


class Envelope extends Component {
    constructor () {
        super();
        this.handleBackgroundClick = this.handleBackgroundClick.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }
    handleBackgroundClick (event) {
        const {module, index, part, patch, handlers} = this.props;
        handlers.handleBackgroundClick(event, module, patch.steps, index, part);
    }
    handleMouseOut (event) {
        const {module, index, part, handlers} = this.props;
        handlers.handleMouseOut(event, module, index, part);
    }
    render () {
        const {handlers, index, module, patch, viewState, activeIndex, width, x, part} = this.props;

        const background = (
            <rect
                height="100%"
                onMouseDown={this.handleBackgroundClick}
                opacity="0"
                ref={(bg) => this.background = bg}
                width="100%"
            />
        );

        return (
            <svg
                className={"controller envelope" + (part ? " " + part : "")}
                height="100%"
                onMouseOut={this.handleMouseOut}
                width={width ? width : "100%"}
                x={x}
            >
                {background}
                <EnvelopeLines
                    steps={patch.steps}
                />
                <EnvelopeCircles
                    activeIndex={activeIndex}
                    background={this.background}
                    envelopeIndex={index}
                    handlers={handlers}
                    module={module}
                    part={part}
                    steps={patch.steps}
                    viewState={viewState}
                />
            </svg>
        );
    }
}

Envelope.propTypes = {
    activeIndex: PropTypes.number,
    handlers: PropTypes.objectOf(PropTypes.func).isRequired,
    index: PropTypes.number,
    module: PropTypes.string.isRequired,
    part: PropTypes.string,
    patch: PropDefs.envelopePatchData.isRequired,
    viewState: PropTypes.array,
    width: PropTypes.string,
    x: PropTypes.string
};

export default Envelope;
