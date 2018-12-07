import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import dispatchers from "../dispatchers";

import {
    envelopesPatchShape,
    modulationEnvelopeSourcesShape,
    sustainEnvelopeViewStateShape
} from "../propdefs";

import SustainEnvelope from "./sustain-envelope.jsx";


class Envelopes extends PureComponent {

    static propTypes = {
        "configuration": modulationEnvelopeSourcesShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": envelopesPatchShape,
        "viewState": PropTypes.arrayOf(sustainEnvelopeViewStateShape)
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

const EnvelopesConnected = connect(null, dispatchers)(Envelopes);

export {
    Envelopes
};

export default EnvelopesConnected;
