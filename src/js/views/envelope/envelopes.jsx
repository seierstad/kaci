import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {
    envelopesPatchShape,
    modulationEnvelopeSourcesShape,
    sustainEnvelopeViewStateShape
} from "../../propdefs";

import SustainEnvelope from "./sustain-envelope.jsx";


class Envelopes extends Component {

    static propTypes = {
        "configuration": modulationEnvelopeSourcesShape.isRequired,
        "handlers": PropTypes.object,
        "patch": envelopesPatchShape,
        "viewState": PropTypes.arrayOf(sustainEnvelopeViewStateShape)
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch || this.props.viewState !== nextProps.viewState;
    }

    render () {
        const {patch, configuration, viewState, handlers} = this.props;
        let envelopes = [];

        for (let i = 0; i < configuration.count; i += 1) {
            envelopes.push(
                <SustainEnvelope
                    handlers={handlers}
                    index={i}
                    key={i}
                    module="envelopes"
                    patch={patch[i] || configuration["default"]}
                    viewState={viewState[i]}
                />
            );
        }

        return <div>{envelopes}</div>;
    }
}


/*
    this.controller.addEventListener('touchstart', this.touchHandler.bind(this), false);
    this.controller.addEventListener('touchend', this.touchHandler.bind(this), false);
    this.controller.addEventListener('touchcancel', this.touchHandler.bind(this), false);
    this.controller.addEventListener('touchmove', this.touchHandler.bind(this), false);
};

    case "touchstart":
    case "touchend":
    case "touchcancel":
        index = this.circleIndex(event);
        if (this.points[index] && this.points[index].draggable) {
            this.points[index].draggable = false;
            this.points[index].circle.setAttribute("r", this.pointRadius + "px");
        }
        break;
    case "touchmove":
        if (pixelCoordinates.x < 0 || pixelCoordinates.y < 0 || pixelCoordinates.x >= svgSize.width || pixelCoordinates.y >= svgSize.height) {

            return touchLeaveHandler(event);
        }
        break;
    }

*/


export default Envelopes;
