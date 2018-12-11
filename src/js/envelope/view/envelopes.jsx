import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import dispatchers from "../dispatchers";

import {envelopeConfigShape} from "../propdefs";

import SustainEnvelope from "./sustain-envelope.jsx";


class Envelopes extends PureComponent {

    static propTypes = {
        "configuration": envelopeConfigShape.isRequired,
        "handlers": PropTypes.object.isRequired
    }

    constructor (props) {
        super(props);
        const {
            handlers = {}
        } = this.props;

        this.boundHandlers = Object.entries(handlers).reduce((acc, [name, func]) => {
            acc[name] = func.bind(this, "envelopes");
            return acc;
        }, {});
    }

    render () {
        const {configuration} = this.props;

        return (
            <div className="envelopes">
                {new Array(configuration.count).fill(null).map((_, index) => (
                    <SustainEnvelope
                        handlers={this.boundHandlers}
                        index={index}
                        key={index}
                    />
                ))}
            </div>
        );
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
