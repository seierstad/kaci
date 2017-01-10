import React, {Component, PropTypes} from "react";

import {toPercent} from "./shared-functions";


class Sustain extends Component {
    constructor () {
        super();
        this.click = this.click.bind(this);
        this.blur = this.blur.bind(this);
        this.mouseDrag = this.mouseDrag.bind(this);
        this.backgroundClick = this.backgroundClick.bind(this);
    }
    backgroundClick (event) {
        const {module, envelopeIndex, handlers} = this.props;
        handlers.sustainBackgroundClick(event, module, envelopeIndex);
    }
    blur (event) {
        const {module, envelopeIndex, part, handlers} = this.props;
        handlers.circleBlur(event, module, envelopeIndex, part);
    }
    mouseDrag (event) {
        const {module, envelopeIndex, part, handlers} = this.props;
        handlers.circleMouseDrag(event, module, envelopeIndex, part, this.background);
    }
    click (event) {
        const {module, envelopeIndex, part, handlers} = this.props;
        handlers.circleClick(event, module, envelopeIndex, part);
    }
    render () {
        const {value, width, active, x} = this.props;
        const background = (
            <rect
                height="100%"
                onMouseDown={this.backgroundClick}
                opacity="0"
                ref={(bg) => this.background = bg}
                width="100%"
            />
        );
        const y = toPercent(1 - value);

        return (
            <svg
                className="controller"
                height="100%"
                width={width ? width : "100%"}
                x={x ? x : 0}
            >
                {background}
                <line
                    className={"sustain-bar" + (active ? " active" : "")}
                    onMouseDown={active ? null : this.click}
                    onMouseMove={active ? this.mouseDrag : null}
                    onMouseOut={active ? this.blur : null}
                    onMouseUp={active ? this.blur : null}
                    strokeWidth={10}
                    x1="0%"
                    x2="100%"
                    y1={y}
                    y2={y}
                />
            </svg>
        );
    }
}
Sustain.propTypes = {
    "active": PropTypes.bool,
    "envelopeIndex": PropTypes.number,
    "handlers": PropTypes.shape({
        "activeCircleMouseUp": PropTypes.func.isRequired,
        "circleBlur": PropTypes.func.isRequired,
        "circleClick": PropTypes.func.isRequired,
        "circleMouseDrag": PropTypes.func.isRequired,
        "mouseOut": PropTypes.func.isRequired,
        "sustainBackgroundClick": PropTypes.func.isRequired
    }).isRequired,
    "module": PropTypes.string.isRequired,
    "part": PropTypes.string,
    "value": PropTypes.number.isRequired,
    "viewState": PropTypes.object.isRequired,
    "width": PropTypes.string,
    "x": PropTypes.string
};


export default Sustain;
