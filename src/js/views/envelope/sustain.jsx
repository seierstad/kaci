import React, {Component} from "react"; import PropTypes from "prop-types";

import {toPercent} from "./shared-functions";


class Sustain extends Component {

    static propTypes = {
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
        "width": PropTypes.string,
        "x": PropTypes.string
    }

    constructor () {
        super();
        this.handleClick = this.handleClick.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleMouseDrag = this.handleMouseDrag.bind(this);
        this.handleBackgroundClick = this.handleBackgroundClick.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return (
            this.props.value !== nextProps.value
            || this.props.active !== nextProps.active
            || this.props.x !== nextProps.x
        );
    }

    handleBackgroundClick (event) {
        const {module, envelopeIndex, handlers} = this.props;
        handlers.sustainBackgroundClick(event, module, envelopeIndex);
    }

    handleBlur (event) {
        const {module, envelopeIndex, part, handlers} = this.props;
        handlers.circleBlur(event, module, envelopeIndex, part);
    }

    handleMouseDrag (event) {
        const {module, envelopeIndex, part, handlers} = this.props;
        handlers.circleMouseDrag(event, module, envelopeIndex, part, this.background);
    }

    handleClick (event) {
        const {module, envelopeIndex, part, handlers} = this.props;
        handlers.circleClick(event, module, envelopeIndex, part);
    }

    render () {
        const {value, width, active, x} = this.props;
        const background = (
            <rect
                height="100%"
                onMouseDown={this.handleBackgroundClick}
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
                    onMouseDown={active ? null : this.handleClick}
                    onMouseMove={active ? this.handleMouseDrag : null}
                    onMouseOut={active ? this.handleBlur : null}
                    onMouseUp={active ? this.handleBlur : null}
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


export default Sustain;
