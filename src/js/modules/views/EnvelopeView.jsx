import React, {Component, PropTypes} from "react";

import {envelopePatchDataShape} from "../propdefs";

const toPercent = (number) => {
    return (number * 100).toString() + "%";
};

class EnvelopeLines extends Component {
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
EnvelopeLines.propTypes = {
    "steps": envelopePatchDataShape.isRequired
};

class Circle extends Component {
    constructor () {
        super();
        this.click = this.click.bind(this);
        this.blur = this.blur.bind(this);
        this.mouseDrag = this.mouseDrag.bind(this);
    }
    blur (event) {
        const {module, envelopeIndex, part, index, handlers, first, last} = this.props;
        handlers.circleBlur(event, module, envelopeIndex, part, index, first, last);
    }
    mouseDrag (event) {
        const {module, envelopeIndex, part, background, index, first, last, handlers} = this.props;
        handlers.circleMouseDrag(event, module, envelopeIndex, part, background, index, first, last);
    }
    click (event) {
        const {module, envelopeIndex, part, index, handlers, first, last} = this.props;
        handlers.circleClick(event, module, envelopeIndex, part, index, first, last);
    }
    render () {
        const {cx, cy, r, active, first, last} = this.props;
        return (
            <circle
                className={(active ? "active" : "") + (first ? " first" : "") + (last ? " last" : "")}
                cx={cx}
                cy={cy}
                onMouseDown={this.click}
                onMouseMove={active ? this.mouseDrag : null}
                onMouseOut={active ? this.blur : null}
                onMouseUp={active ? this.blur : null}
                r={r}
            />
        );
    }
}
Circle.propTypes = {
    "active": PropTypes.bool,
    "background": PropTypes.element,
    "cx": PropTypes.string.isRequired,
    "cy": PropTypes.string.isRequired,
    "envelopeIndex": PropTypes.number,
    "first": PropTypes.bool,
    "handlers": PropTypes.shape({
        "circleBlur": PropTypes.func.isRequired,
        "circleClick": PropTypes.func.isRequired,
        "circleMouseDrag": PropTypes.func.isRequired
    }),
    "index": PropTypes.number.isRequired,
    "last": PropTypes.bool,
    "module": PropTypes.string.isRequired,
    "part": PropTypes.string,
    "r": PropTypes.number.isRequired
};


import {envelopeViewStateShape} from "../propdefs";
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
    "steps": envelopePatchDataShape.isRequired,
    "viewState": envelopeViewStateShape.isRequired
};


class Sustain extends Component {
    constructor () {
        super();
        this.click = this.click.bind(this);
        this.blur = this.blur.bind(this);
        this.mouseDrag = this.mouseDrag.bind(this);
        this.backgroundClick = this.backgroundClick.bind(this);
    }
    backgroundClick (event) {
        const {module, envelopeIndex, handlers} = this.props;
        handlers.sustainBackgroundClick(event, module, envelopeIndex);
    }
    blur (event) {
        const {module, envelopeIndex, part, handlers} = this.props;
        handlers.circleBlur(event, module, envelopeIndex, part);
    }
    mouseDrag (event) {
        const {module, envelopeIndex, part, handlers} = this.props;
        handlers.circleMouseDrag(event, module, envelopeIndex, part, this.background);
    }
    click (event) {
        const {module, envelopeIndex, part, handlers} = this.props;
        handlers.circleClick(event, module, envelopeIndex, part);
    }
    render () {
        const {value, width, active, x} = this.props;
        const background = (
            <rect
                height="100%"
                onMouseDown={this.backgroundClick}
                opacity="0"
                ref={(bg) => this.background = bg}
                width="100%"
            />
        );
        const y = toPercent(1 - value);

        return (
            <svg
                className="controller"
                height="100%"
                width={width ? width : "100%"}
                x={x ? x : 0}
            >
                {background}
                <line
                    className={"sustain-bar" + (active ? " active" : "")}
                    onMouseDown={active ? null : this.click}
                    onMouseMove={active ? this.mouseDrag : null}
                    onMouseOut={active ? this.blur : null}
                    onMouseUp={active ? this.blur : null}
                    strokeWidth={10}
                    x1="0%"
                    x2="100%"
                    y1={y}
                    y2={y}
                />
            </svg>
        );
    }
}
Sustain.propTypes = {
    "active": PropTypes.bool,
    "envelopeIndex": PropTypes.number,
    "handlers": PropTypes.shape({
        "activeCircleMouseUp": PropTypes.func.isRequired,
        "circleBlur": PropTypes.func.isRequired,
        "circleClick": PropTypes.func.isRequired,
        "circleMouseDrag": PropTypes.func.isRequired,
        "mouseOut": PropTypes.func.isRequired,
        "sustainBackgroundClick": PropTypes.func.isRequired
    }).isRequired,
    "module": PropTypes.string.isRequired,
    "part": PropTypes.string,
    "value": PropTypes.number.isRequired,
    "viewState": PropTypes.object.isRequired,
    "width": PropTypes.string,
    "x": PropTypes.string
};


class Envelope extends Component {
    constructor () {
        super();
        this.backgroundClick = this.backgroundClick.bind(this);
        this.mouseOut = this.mouseOut.bind(this);
    }
    backgroundClick (event) {
        const {module, index, part, patch, handlers} = this.props;
        handlers.backgroundClick(event, module, patch.steps, index, part);
    }
    mouseOut (event) {
        const {module, index, part, patch, handlers} = this.props;
        handlers.mouseOut(event, module, index, part);
    }
    render () {
        const {handlers, index, module, patch, viewState, activeIndex, width, x, part} = this.props;
        const {backgroundClick, envelopeBlur} = handlers;

        this.patch = patch;
        const background = (
            <rect
                height="100%"
                onMouseDown={this.backgroundClick}
                opacity="0"
                ref={(bg) => this.background = bg}
                width="100%"
            />
        );

        return (
            <svg
                className={"controller envelope" + (part ? " " + part : "")}
                height="100%"
                onMouseOut={this.mouseOut}
                width={width ? width : "100%"}
                x={x}
            >
                {background}
                <EnvelopeLines
                    steps={patch.steps}
                />
                <EnvelopeCircles
                    activeIndex={activeIndex}
                    background={this.background}
                    envelopeIndex={index}
                    handlers={handlers}
                    module={module}
                    part={part}
                    steps={patch.steps}
                    viewState={viewState}
                />
            </svg>
        );
    }
}
Envelope.propTypes = {
    "activeIndex": PropTypes.number,
    "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
    "index": PropTypes.number,
    "module": PropTypes.string.isRequired,
    "part": PropTypes.string,
    "patch": PropTypes.shape({
        "steps": PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired
    }).isRequired,
    "viewState": PropTypes.array,
    "width": PropTypes.string,
    "x": PropTypes.string
};


import {sustainEnvelopePatchDataShape} from "../propdefs";

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


import {modulationEnvelopeSourcesShape, envelopesPatchDataShape, sustainEnvelopeViewStateShape} from "../propdefs";

class Envelopes extends Component {
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
Envelopes.propTypes = {
    "configuration": modulationEnvelopeSourcesShape.isRequired,
    "handlers": PropTypes.object,
    "patch": envelopesPatchDataShape,
    "viewState": PropTypes.arrayOf(sustainEnvelopeViewStateShape)
};

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
export {Envelope, SustainEnvelope};
export default Envelopes;
