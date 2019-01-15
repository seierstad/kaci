import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";
import {connect} from "react-redux";

import {getSustainEnvelopeByIndex} from "../selectors";
import Envelope from "./envelope.jsx";
import Sustain from "./sustain.jsx";


class SustainEnvelope extends Component {

    static propTypes = {
        "envelopeViewObject": PropTypes.object.isRequired,
        "handlers": PropTypes.object.isRequired,
        "index": PropTypes.number.isRequired
    }

    constructor (props) {
        super(props);
        const {
            handlers = {},
            index
        } = this.props;

        this.boundHandlers = Object.entries(handlers).reduce((acc, [name, func]) => {
            acc[name] = func.bind(this, index);
            return acc;
        }, {});
    }

    @autobind
    handleMouseOut (event) {
        const {index, handlers} = this.props;
        handlers.mouseOut(event, module, index);
    }

    @autobind
    handleAttackDurationChange (event) {
        this.boundHandlers.durationChange("attack", parseFloat(event.target.value));
    }

    @autobind
    handleReleaseDurationChange (event) {
        this.boundHandlers.durationChange("release", parseFloat(event.target.value));
    }

    render () {
        const {envelopeViewObject = {}, index} = this.props;
        const {attack, release, sustain} = envelopeViewObject;

        const attackPart = attack.duration / (attack.duration + release.duration);
        const releasePart = release.duration / (attack.duration + release.duration);
        const sustainWidth = 10;
        const attackWidth = attackPart * (100 - sustainWidth);
        const releaseWidth = releasePart * (100 - sustainWidth);

        return (
            <section className="envelope">
                <h1><abbr title="envelope">Env</abbr> {index + 1}</h1>
                <svg
                    className="sustain-envelope controller"
                    onMouseOut={envelopeViewObject.editSustain ? this.handleMouseOut : null}
                >

                    <Envelope
                        data={attack}
                        handlers={this.boundHandlers}
                        part="attack"
                        width={attackWidth + "%"}
                    />

                    <Envelope
                        data={release}
                        handlers={this.boundHandlers}
                        part="release"
                        width={releaseWidth + "%"}
                        x={(attackWidth + sustainWidth) + "%"}
                    />
                    <Sustain
                        data={sustain}
                        handlers={this.boundHandlers}
                        width={sustainWidth + "%"}
                        x={attackWidth + "%"}
                    />
                </svg>
                <label htmlFor={"env-" + index + "-attack-duration"}>attack duration</label>
                <input
                    id={"env-" + index + "-attack-duration"}
                    min={0}
                    onChange={this.handleAttackDurationChange}
                    onInput={this.handleAttackDurationChange}
                    type="number"
                    value={attack.duration}
                />
                <label htmlFor={"env-" + index + "-release-duration"}>release duration</label>
                <input
                    id={"env-" + index + "-release-duration"}
                    min={0}
                    onChange={this.handleReleaseDurationChange}
                    onInput={this.handleReleaseDurationChange}
                    type="number"
                    value={release.duration}
                />
            </section>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    envelopeViewObject: getSustainEnvelopeByIndex(state, ownProps)
});

const SustainEnvelopeConnected = connect(mapStateToProps)(SustainEnvelope);

export default SustainEnvelopeConnected;
