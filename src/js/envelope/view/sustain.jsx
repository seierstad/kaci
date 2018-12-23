import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {getValuePair} from "../../views/ViewUtils";
import {toPercent} from "./shared-functions";


class Sustain extends Component {

    static propTypes = {
        "data": PropTypes.object.isRequired,
        "handlers": PropTypes.shape({
            "activeCircleMouseUp": PropTypes.func.isRequired,
            "backgroundClick": PropTypes.func.isRequired,
            "circleBlur": PropTypes.func.isRequired,
            "circleClick": PropTypes.func.isRequired,
            "circleMouseDrag": PropTypes.func.isRequired,
            "mouseOut": PropTypes.func.isRequired
        }).isRequired,
        "width": PropTypes.string,
        "x": PropTypes.string
    }

    constructor (props) {
        super(props);
        const {handlers = {}} = this.props;
        this.background = React.createRef();
        this.boundHandlers = Object.entries(handlers).reduce((acc, [name, func]) => {
            acc[name] = func.bind(this, "sustain");
            return acc;
        }, {});
    }

    @autobind
    handleBackgroundClick (event) {
        const point = getValuePair(event, event.target);
        this.boundHandlers.backgroundClick(point);
    }

    @autobind
    handleBlur (event) {
        this.boundHandlers.circleBlur(event);
    }

    @autobind
    handleMouseDrag (event) {
        const pos = getValuePair(event, this.background.current);
        this.boundHandlers.circleMouseDrag(null, pos);
    }

    @autobind
    handleClick (event) {
        this.boundHandlers.circleClick(event);
    }

    render () {
        const {data: {value, active}, width, x} = this.props;
        const y = toPercent(1 - value);

        return (
            <svg
                className="controller"
                height="100%"
                width={width ? width : "100%"}
                x={x ? x : 0}
            >
                <rect
                    height="100%"
                    onMouseDown={this.handleBackgroundClick}
                    opacity="0"
                    ref={this.background}
                    width="100%"
                />
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
