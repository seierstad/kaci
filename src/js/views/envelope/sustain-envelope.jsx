import React, {Component, PropTypes} from "react";

import Envelope from "./envelope.jsx";
import Sustain from "./sustain.jsx";


import {sustainEnvelopePatchDataShape} from "../../propdefs";

class SustainEnvelope extends Component {
    constructor () {
        super();
        this.mouseOut = this.mouseOut.bind(this);
        this.attackDurationChange = this.attackDurationChange.bind(this);
        this.releaseDurationChange = this.releaseDurationChange.bind(this);
    }
    mouseOut (event) {
        const {module, index, handlers} = this.props;
        handlers.mouseOut(event, module, index);
    }
    attackDurationChange (event) {
        const {module, index, handlers} = this.props;
        handlers.durationChange(event, module, index, "attack");
    }
    releaseDurationChange (event) {
        const {module, index, handlers} = this.props;
        handlers.durationChange(event, module, index, "release");
    }

    render () {
        const {module, index, patch, viewState, handlers} = this.props;
        const {mouseOut, durationChange} = handlers;

        const attackPart = patch.attack.duration / (patch.attack.duration + patch.release.duration);
        const releasePart = patch.release.duration / (patch.attack.duration + patch.release.duration);
        const sustainWidth = 10;
        const attackWidth = attackPart * (100 - sustainWidth);
        const releaseWidth = releasePart * (100 - sustainWidth);

        return (
            <section className="envelope">
                <h1><abbr title="envelope">Env</abbr> {index + 1}</h1>
                <svg
                    className="sustain-envelope controller"
                    onMouseOut={viewState.editSustain ? this.mouseOut : null}
                >

                    <Envelope
                        activeIndex={viewState.editSustain ? patch.attack.steps.length - 1 : null}
                        handlers={handlers}
                        index={index}
                        module={module}
                        part="attack"
                        patch={patch.attack}
                        viewState={viewState.attack}
                        width={attackWidth + "%"}
                    />

                    <Envelope
                        activeIndex={viewState.editSustain ? 0 : null}
                        handlers={handlers}
                        index={index}
                        module={module}
                        part="release"
                        patch={patch.release}
                        viewState={viewState.release}
                        width={releaseWidth + "%"}
                        x={(attackWidth + sustainWidth) + "%"}
                    />
                    <Sustain
                        active={!!viewState.editSustain}
                        envelopeIndex={index}
                        handlers={handlers}
                        module={module}
                        part="sustain"
                        value={patch.attack.steps.slice(-1)[0][1]}
                        viewState={viewState}
                        width={sustainWidth + "%"}
                        x={attackWidth + "%"}
                    />
                </svg>
                <label htmlFor={"env-" + index + "-attack-duration"}>attack duration</label>
                <input
                    id={"env-" + index + "-attack-duration"}
                    min={0}
                    onChange={this.attackDurationChange}
                    onInput={this.attackDurationChange}
                    type="number"
                    value={patch.attack.duration}
                />
                <label htmlFor={"env-" + index + "-release-duration"}>release duration</label>
                <input
                    id={"env-" + index + "-release-duration"}
                    min={0}
                    onChange={this.releaseDurationChange}
                    onInput={this.releaseDurationChange}
                    type="number"
                    value={patch.release.duration}
                />
            </section>
        );
    }
}
SustainEnvelope.propTypes = {
    "handlers": PropTypes.object.isRequired,
    "index": PropTypes.number.isRequired,
    "module": PropTypes.string.isRequired,
    "patch": sustainEnvelopePatchDataShape.isRequired,
    "viewState": PropTypes.object
};


export default SustainEnvelope;
