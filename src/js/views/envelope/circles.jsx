import React, {Component} from "react"; import PropTypes from "prop-types";
import {envelopeViewStateShape, envelopePatchShape} from "../../propdefs";
import Circle from "./circle.jsx";
import {toPercent} from "./shared-functions";


class EnvelopeCircles extends Component {

    static propTypes = {
        "activeIndex": PropTypes.number,
        "background": PropTypes.element,
        "envelopeIndex": PropTypes.number,
        "handlers": PropTypes.object,
        "module": PropTypes.string.isRequired,
        "part": PropTypes.string,
        "steps": envelopePatchShape.isRequired,
        "viewState": envelopeViewStateShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.steps !== nextProps.steps) || (this.props.viewState !== nextProps.viewState) || (this.props.activeIndex !== nextProps.activeIndex);
    }

    render () {
        const {module, envelopeIndex, part, steps, handlers, viewState, activeIndex, background} = this.props;
        let inactive = [];
        let active = [];

        const circle = (point, index, arr) => {
            const isActive = viewState.indexOf(index) !== -1 || index === activeIndex;
            const c = (
                <Circle
                    active={isActive}
                    background={background}
                    cx={toPercent(arr[index][0])}
                    cy={toPercent(1 - arr[index][1])}
                    envelopeIndex={envelopeIndex}
                    first={index === 0}
                    handlers={handlers}
                    index={index}
                    key={index + "_" + point[0]}
                    last={index === arr.length - 1}
                    module={module}
                    part={part}
                    r={10}
                />
            );
            if (isActive) {
                active.push(c);
            } else {
                inactive.push(c);
            }
        };
        steps.map(circle);

        return (
            <g className="circles">
                {inactive}
                {active}
            </g>
        );
    }
}


export default EnvelopeCircles;
