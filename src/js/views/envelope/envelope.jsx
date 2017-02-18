import React, {Component, PropTypes} from "react";

import Lines from "./lines.jsx";
import Circles from "./circles.jsx";


class Envelope extends Component {

    static propTypes = {
        "activeIndex": PropTypes.number,
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "index": PropTypes.number,
        "module": PropTypes.string.isRequired,
        "part": PropTypes.string,
        "patch": PropTypes.shape({
            "steps": PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired
        }).isRequired,
        "viewState": PropTypes.array,
        "width": PropTypes.string,
        "x": PropTypes.string
    }

    constructor () {
        super();
        this.handleBackgroundClick = this.handleBackgroundClick.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return (
            this.props.patch !== nextProps.patch
            || this.props.viewState !== nextProps.viewState
            || this.props.activeIndex !== nextProps.activeIndex
            || this.props.x !== nextProps.x
            || this.props.width !== nextProps.width
        );
    }

    handleBackgroundClick (event) {
        const {module, index, part, patch, handlers} = this.props;
        handlers.backgroundClick(event, module, patch.steps, index, part);
    }

    handleMouseOut (event) {
        const {module, index, part, handlers} = this.props;
        handlers.mouseOut(event, module, index, part);
    }

    render () {
        const {handlers, index, module, patch, viewState, activeIndex, width, x, part} = this.props;

        this.patch = patch;

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
                <Lines
                    steps={patch.steps}
                />
                <Circles
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


export default Envelope;
