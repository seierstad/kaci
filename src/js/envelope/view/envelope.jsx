import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {getValuePair} from "../../views/ViewUtils";
import {getEnvelopeCached} from "../selectors";
import Lines from "./lines.jsx";
import Circles from "./circles.jsx";


class Envelope extends Component {

    static propTypes = {
        "data": PropTypes.shape({
            "steps": PropTypes.arrayOf(PropTypes.object).isRequired
        }).isRequired,
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "part": PropTypes.string,
        "width": PropTypes.string,
        "x": PropTypes.string
    }

    constructor (props) {
        super(props);
        const {
            handlers = {},
            part
        } = this.props;

        this.background = React.createRef();

        this.boundHandlers = Object.entries(handlers).reduce((acc, [name, func]) => {
            acc[name] = func.bind(this, part);
            return acc;
        }, {});
    }

    @autobind
    handleBackgroundClick (event) {
        const point = getValuePair(event, this.background.current);
        const {part, handlers, data: {steps}} = this.props;
        const index = steps.findIndex(step => step.x > point.x);
        handlers.backgroundClick(part, point, index);
    }

    @autobind
    handleMouseOut (event) {
        const pos = getValuePair(event, this.background.current);
        this.boundHandlers.mouseOut(pos);
    }

    @autobind
    circleMouseDragHandler (index, event) {
        const point = getValuePair(event, this.background.current);
        this.boundHandlers.circleMouseDrag(index, point);
    }

    render () {
        const {
            data,
            part,
            width,
            x
        } = this.props;

        const classNames = ["controller", "envelope"];
        if (part) {
            classNames.push(part);
        }

        return (
            <svg
                className={classNames.join(" ")}
                height="100%"
                onMouseOut={this.handleMouseOut}
                width={width ? width : "100%"}
                x={x}
            >
                <rect
                    height="100%"
                    onMouseDown={this.handleBackgroundClick}
                    opacity="0"
                    ref={this.background}
                    width="100%"
                />
                <Lines
                    steps={data.steps}
                />
                <Circles
                    circleMouseDragHandler={this.circleMouseDragHandler}
                    handlers={this.boundHandlers}
                    steps={data.steps}
                />
            </svg>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    "data": getEnvelopeCached(state, ownProps)
});

const EnvelopeConnected = connect(mapStateToProps)(Envelope);

export {
    EnvelopeConnected
};

export default Envelope;
