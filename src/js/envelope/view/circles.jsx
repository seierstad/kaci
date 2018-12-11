import React, {Component} from "react";
import PropTypes from "prop-types";

import Circle from "./circle.jsx";


class EnvelopeCircles extends Component {

    static propTypes = {
        "circleMouseDragHandler": PropTypes.func.isRequired,
        "handlers": PropTypes.object,
        "steps": PropTypes.arrayOf(PropTypes.object.isRequired).isRequired
    }

    render () {
        const {
            circleMouseDragHandler,
            steps,
            handlers
        } = this.props;

        const mapSteps = (step) => (
            <Circle
                circleMouseDragHandler={circleMouseDragHandler}
                handlers={handlers}
                key={step.index}
                point={step}
                r={10}
            />
        );

        return (
            <g className="circles">
                {steps.filter(step => !step.active).map(mapSteps)}
                {steps.filter(step => !!step.active).map(mapSteps)}
            </g>
        );
    }
}


export default EnvelopeCircles;
