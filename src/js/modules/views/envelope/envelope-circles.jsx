import React, {Component, PropTypes} from "react";

import * as PropDefs from "../../../proptype-defs";
import {toPercent} from "./envelope-commons";

import Circle from "./circle.jsx";


class EnvelopeCircles extends Component {

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
EnvelopeCircles.propTypes = {
    "activeIndex": PropTypes.number,
    "background": PropTypes.element,
    "envelopeIndex": PropTypes.number,
    "handlers": PropTypes.object,
    "module": PropTypes.string.isRequired,
    "part": PropTypes.string,
    "steps": PropDefs.envelopePatchData.isRequired,
    "viewState": PropDefs.envelopeViewState.isRequired
};


export default EnvelopeCircles;
