import React, {PureComponent} from "react";
import PropTypes from "prop-types";

import {toPercent} from "./shared-functions";

class EnvelopeLines extends PureComponent {

    static propTypes = {
        "steps": PropTypes.arrayOf(PropTypes.object.isRequired).isRequired
    }

    render () {
        const { steps } = this.props;
        const line = (step, index, arr) => {
            if (index === 0) {
                return null;
            }
            const prevStep = arr[index - 1];
            return (
                <line
                    key={"line-" + index + "_of_" + arr.length}
                    x1={toPercent(prevStep.x)}
                    x2={toPercent(step.x)}
                    y1={toPercent(1 - prevStep.y)}
                    y2={toPercent(1 - step.y)}
                />
            );
        };

        return (
            <g className="lines">
                {steps.map(line)}
            </g>
        );
    }
}


export default EnvelopeLines;
