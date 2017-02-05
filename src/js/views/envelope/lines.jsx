import React, {Component} from "react";
import {envelopePatchDataShape} from "../../propdefs";

import {toPercent} from "./shared-functions";

class EnvelopeLines extends Component {

    static propTypes = {
        "steps": envelopePatchDataShape.isRequired
    }

    render () {
        const { steps } = this.props;
        const line = (step, index, arr) => {
            if (index === 0) {
                return null;
            }
            return (
                <line
                    key={"line-" + index + "_of_" + arr.length}
                    x1={toPercent(arr[index - 1][0])}
                    x2={toPercent(arr[index][0])}
                    y1={toPercent(1 - arr[index - 1][1])}
                    y2={toPercent(1 - arr[index][1])}
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
