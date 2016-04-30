import React, {Component, PropTypes} from "react";

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
                    y1={toPercent(1 - arr[index - 1][1])}
                    x2={toPercent(arr[index][0])} 
                    y2={toPercent(1 - arr[index][1])}
                />
            );
        }

        return (
            <g className="lines">
                {steps.map(line)}
            </g>
        );
    }
}
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
                cx={cx}
                cy={cy}
                r={r}
                className={(active ? "active" : "") + (first ? " first" : "") + (last ? " last" : "") }
                onMouseMove={active ? this.mouseDrag : null}
                onMouseDown={this.click}
                onMouseUp={active ? this.blur : null}
                onMouseOut={active ? this.blur : null}
            />
        );
    }    
}
Circle.propTypes = {
    cx: PropTypes.string.isRequired,
    cy: PropTypes.string.isRequired,
    r: PropTypes.number.isRequired,
    active: PropTypes.bool,
    first: PropTypes.bool,
    last: PropTypes.bool,
    handlers: PropTypes.shape({
        circleClick: PropTypes.func.isRequired,
        circleBlur: PropTypes.func.isRequired,
        circleMouseDrag: PropTypes.func.isRequired
    }),
    module: PropTypes.string.isRequired,
    envelopeIndex: PropTypes.number,
    part: PropTypes.string,
    index: PropTypes.number.isRequired,
};


class EnvelopeCircles extends Component {

    render () {
        const {module, envelopeIndex, part, steps, handlers, viewState, activeIndex, background} = this.props;
        let inactive = [];
        let active = [];

        const circle = (point, index, arr) => {
            const isActive = viewState.indexOf(index) !== -1 || index === activeIndex;
            const c = (
                <Circle 
                    cx={toPercent(arr[index][0])}
                    cy={toPercent(1 - arr[index][1])}
                    r={10}
                    envelopeIndex={envelopeIndex}
                    key={index + "_" + point[0]}
                    active={isActive}
                    first={index === 0}
                    last={index === arr.length - 1}
                    module={module}
                    index={index}
                    part={part}
                    background={background}
                    handlers={handlers}
                    />
            );
            if (isActive) {
                active.push(c);
            } else {
                inactive.push(c);
            }
        }
        steps.map(circle);

        return (
            <g className="circles">
                {inactive}
                {active}        
            </g>
        );
    }
}

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
        const background = (<rect 
            ref={(bg) => this.background = bg}
            onMouseDown={this.backgroundClick}
            width="100%" 
            height="100%" 
            opacity="0"
        />);
        const y = toPercent(1 - value);

        return (
            <svg
                x={x ? x : 0}
                className="controller"
                height="100%"
                width={width ? width : "100%"}>
                {background}
                <line
                    onMouseMove={active ? this.mouseDrag : null}
                    onMouseUp={active ? this.blur : null}
                    onMouseOut={active ? this.blur : null}
                    onMouseDown={active ? null : this.click}
                    strokeWidth={10}
                    y1={y}
                    y2={y}
                    x1="0%"
                    x2="100%"
                    className={"sustain-bar" + (active ? " active" : "")}
                />
            </svg>
        );
    }
}
Sustain.propTypes = {
    value: PropTypes.number.isRequired,
    module: PropTypes.string.isRequired,
    envelopeIndex: PropTypes.number,
    part: PropTypes.string,
    width: PropTypes.string,
    active: PropTypes.bool,
    viewState: PropTypes.object.isRequired,
    x: PropTypes.string,
    handlers: PropTypes.shape({
        circleClick: PropTypes.func.isRequired,
        activeCircleMouseUp: PropTypes.func.isRequired,
        envelopeBlur: PropTypes.func.isRequired,
        circleBlur: PropTypes.func.isRequired,
        sustainBackgroundClick: PropTypes.func.isRequired,
        circleMouseDrag: PropTypes.func.isRequired
    }).isRequired
}


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
        const {module,index, part, patch, handlers} = this.props;
        handlers.mouseOut(event, module, index, part);
    }
    render () {
        const {handlers, index, module, patch, viewState, activeIndex, width, x, part} = this.props;
        const {backgroundClick, envelopeBlur} = handlers;

        this.patch = patch;
        const background = (<rect 
            ref={(bg) => this.background = bg}
            onMouseDown={this.backgroundClick} 
            width="100%" 
            height="100%" 
            opacity="0" 
        />);

        return (
            <svg 
                height="100%"
                width={width ? width : "100%"}
                x={x}
                className={"controller" + (part ? " " + part : "")}
                onMouseOut={this.mouseOut}
                >
                {background}
                <EnvelopeLines 
                    steps={patch.steps} />
                <EnvelopeCircles
                    module={module}
                    envelopeIndex={index}
                    part={part}
                    steps={patch.steps}
                    handlers={handlers}
                    viewState={viewState} 
                    activeIndex={activeIndex}
                    background={this.background}/>
            </svg>
        );
    }
};
Envelope.propTypes = {
    patch: PropTypes.shape({
        steps: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired
    }).isRequired,
    module: PropTypes.string.isRequired,
    part: PropTypes.string,
    index: PropTypes.number,
    handlers: PropTypes.objectOf(PropTypes.func).isRequired,
    viewState: PropTypes.array,
    width: PropTypes.string,
    x: PropTypes.string,
    activeIndex: PropTypes.number
}


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
                    onMouseOut={viewState.editSustain ? this.mouseOut : null}>

                    <Envelope
                        patch={patch.attack}
                        module={module}
                        part="attack"
                        index={index}
                        handlers={handlers}
                        viewState={viewState.attack}
                        width={attackWidth + "%"}
                        activeIndex={viewState.editSustain ? patch.attack.steps.length - 1 : null}
                    />

                    <Envelope
                        patch={patch.release}
                        module={module}
                        part="release"
                        index={index}
                        handlers={handlers}
                        viewState={viewState.release}
                        width={releaseWidth + "%"}
                        x={(attackWidth + sustainWidth) + "%"}
                        activeIndex={viewState.editSustain ? 0 : null}
                    />
                    <Sustain
                        value={patch.attack.steps.slice(-1)[0][1]}
                        module={module}
                        envelopeIndex={index}
                        part="sustain"
                        active={!!viewState.editSustain}
                        width={sustainWidth + "%"}
                        viewState={viewState}
                        x={attackWidth + "%"}
                        handlers={handlers}
                    />
                </svg>
                <label htmlFor={"env-" + index + "-attack-duration"}>attack duration</label>
                <input 
                    id={"env-" + index + "-attack-duration"}
                    type="number"
                    min={0}
                    value={patch.attack.duration} 
                    onInput={this.attackDurationChange}
                    onChange={this.attackDurationChange}
                />
                <label htmlFor={"env-" + index + "-release-duration"}>release duration</label>
                <input 
                    id={"env-" + index + "-release-duration"}
                    type="number"
                    min={0}
                    value={patch.release.duration} 
                    onInput={this.releaseDurationChange}
                    onChange={this.releaseDurationChange}
                />
            </section>
        );
    }
}


class Envelopes extends Component {
    render () {
        const {patch, configuration, viewState, handlers} = this.props;
        let envelopes = [];

        for (let i = 0; i < configuration.count; i += 1) {
            envelopes.push(<SustainEnvelope 
                key={i} 
                index={i}
                module="envelopes"
                handlers={handlers}
                patch={patch[i] || configuration["default"]} 
                viewState={viewState[i]} />
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
export {Envelope, SustainEnvelope};
export default Envelopes;