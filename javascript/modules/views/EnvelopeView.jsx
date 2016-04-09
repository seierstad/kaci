import React, {Component} from "react";
import { connect } from "react-redux";
import * as Actions from "../Actions.jsx";

import { getOffsetElement, cursorPosition, sizeInPixels } from "./ViewUtils";

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


class EnvelopeCircles extends Component {
    render () {
        const { steps, onClick, onBlur, onDrag, viewState, activeIndex, background } = this.props;

        let inactive = [];
        let active = [];

        const circle = (point, index, arr) => {
            const isActive = viewState.indexOf(index) !== -1 || index === activeIndex;
            const c = (
                <circle
                    cx={toPercent(arr[index][0])} 
                    cy={toPercent(1 - arr[index][1])}
                    r={10}
                    className={(isActive ? "active" : "") + (index === 0 ? " first" : "") + (index === arr.length - 1 ? " last" : "") }
                    key={"circle-" + index + "_of_" + arr.length}
                    onMouseMove={isActive ? onDrag(index, background) : null}
                    onMouseDown={onClick(index)}
                    onMouseUp={isActive ? onBlur(index) : null}
                    onMouseOut={isActive ? onBlur(index) : null}
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

class SustainView extends Component {
    render () {
        const {patch, width, viewState, x, onBackgroundClick} = this.props;
        const background = (<rect 
            ref={(bg) => this.background = bg}
            onMouseDown={onBackgroundClick}
            width="100%" 
            height="100%" 
            opacity="0"
        />);
        const y = toPercent(1 - patch.attack.steps.slice(-1)[0][1]);
        return (
            <svg
                x={x ? x : 0}
                className="controller"
                height="100%"
                width={width ? width : "100%"}>
                {background}
                <line
                    strokeWidth="10"
                    y1={y}
                    y2={y}
                    x1="0%"
                    x2="100%"
                    className="sustain-bar"
                />
            </svg>
        );
    }
}

class EnvelopeView extends Component {
    render () {
        const { onBackgroundClick, onCircleClick, onCircleMouseDrag, onEnvelopeBlur, onCircleBlur, patch, viewState, activeIndex, width, x, className } = this.props;
        this.patch = patch;
        const background = (<rect 
            ref={(bg) => this.background = bg}
            onMouseDown={onBackgroundClick(this.patch.steps)} 
            width="100%" 
            height="100%" 
            opacity="0" 
        />);

        return (
            <svg 
                height="100%"
                width={width ? width : "100%"}
                x={x}
                className={"controller" + (className ? " " + className : "")}>
                {background}
                <EnvelopeLines 
                    steps={patch.steps} />
                <EnvelopeCircles 
                    steps={patch.steps} 
                    onClick={onCircleClick} 
                    onBlur={onCircleBlur} 
                    onDrag={onCircleMouseDrag}
                    viewState={viewState} 
                    activeIndex={activeIndex}
                    background={this.background}/>
            </svg>
        );
    }
};

class SustainEnvelopePresentation extends Component {
    render () {
        const {index, patch, viewState, onMouseOut, onCircleClick, onCircleBlur, onCircleMouseDrag, onBackgroundClick, onSustainBackgroundClick, onEnvelopeBlur, onDurationChange} = this.props;
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
                    onMouseOut={viewState.editSustain ? onMouseOut(index) : null}>

                    <EnvelopeView 
                        patch={patch.attack}
                        className="attack"
                        onEnvelopeBlur={onEnvelopeBlur(index, "attack")}
                        onCircleClick={onCircleClick(index, "attack", patch.attack.steps.length)}
                        onBackgroundClick={onBackgroundClick(index, "attack")}
                        onCircleBlur={onCircleBlur(index, "attack", patch.attack.steps.length)}
                        onCircleMouseDrag={onCircleMouseDrag(index, "attack", patch.attack.steps.length)}
                        viewState={viewState.attack}
                        width={attackWidth + "%"}
                        activeIndex={viewState.editSustain ? patch.attack.steps.length - 1 : null}
                    />

                    <EnvelopeView 
                        patch={patch.release}
                        className="release"
                        onEnvelopeBlur={onEnvelopeBlur(index, "release")} 
                        onCircleClick={onCircleClick(index, "release", patch.release.steps.length)}
                        onBackgroundClick={onBackgroundClick(index, "release")}
                        onCircleBlur={onCircleBlur(index, "release", patch.release.steps.length)}
                        onCircleMouseDrag={onCircleMouseDrag(index, "release", patch.release.steps.length)}
                        viewState={viewState.release}
                        width={releaseWidth + "%"}
                        x={(attackWidth + sustainWidth) + "%"}
                        activeIndex={viewState.editSustain ? 0 : null}
                    />
                    <SustainView
                        patch={patch}
                        width={sustainWidth + "%"}
                        viewState={viewState}
                        x={attackWidth + "%"}
                        onBackgroundClick={onSustainBackgroundClick(index)}
                    />
                </svg>
                <label htmlFor={"env-" + index + "-attack-duration"}>attack duration</label>
                <input 
                    type="number" 
                    value={patch.attack.duration} 
                    onInput={onDurationChange(index, "attack")}
                    onChange={onDurationChange(index, "attack")}
                />
                <label htmlFor={"env-" + index + "-release-duration"}>release duration</label>
                <input 
                    type="number" 
                    value={patch.release.duration} 
                    onInput={onDurationChange(index, "release")}
                    onChange={onDurationChange(index, "release")}
                />

            </section>
        );
    }
}

const getValuePair = (evt, element) => {
    const pos = element.getBoundingClientRect();
    const x = (evt.clientX - pos.left) / pos.width;
    const y = 1 - (evt.clientY - pos.top) / pos.height; 
    return {x, y};
}

const mapDispatchToSustainEnvelopeProps = (dispatch) => {
    return {
        onCircleClick: (envelopeIndex, envelopePart, stepCount) => (index) => (event) => {
            if (event.shiftKey) {
                dispatch({
                    type: Actions.ENVELOPE_POINT_DELETE,
                    envelopeIndex,
                    envelopePart,
                    index
                });
            } else {
                if ((envelopePart === "release" && index === 0) || envelopePart === "attack" && index === stepCount - 1) {
                    dispatch({
                        type: Actions.ENVELOPE_SUSTAIN_EDIT_START,
                        envelopeIndex
                    });
                } else {
                    dispatch({
                        type: Actions.ENVELOPE_POINT_EDIT_START,
                        envelopeIndex,
                        envelopePart,
                        index
                    });
                }
            }
        },
        onMouseOut: (envelopeIndex) => (evt) => {
            const pos = getValuePair(evt, evt.currentTarget);
            if (pos.x > 1 || pos.x < 0 || pos.y > 1 || pos.y < 0) {
                dispatch({
                    type: Actions.ENVELOPE_SUSTAIN_EDIT_END,
                    envelopeIndex
                })            
            }
        },
        onActiveCircleMouseUp: (envelopeIndex, envelopePart) => (index) => {
            dispatch({
                type: Actions.ENVELOPE_POINT_EDIT_END,
                envelopeIndex,
                envelopePart,
                index
            })
        },
        onEnvelopeBlur: (envelopeIndex, envelopePart) => (event) => {
            dispatch({
                type: Actions.ENVELOPE_BLUR,
                envelopeIndex,
                envelopePart
            })
        },
        onCircleBlur: (envelopeIndex, envelopePart, stepCount) => (index) => (event) => {
            if ((envelopePart === "release" && index === 0) || envelopePart === "attack" && index === stepCount - 1) {
                dispatch({
                    type: Actions.ENVELOPE_SUSTAIN_EDIT_END,
                    envelopeIndex
                });
            } else {
                dispatch({
                    type: Actions.ENVELOPE_POINT_EDIT_END,
                    envelopeIndex,
                    envelopePart,
                    index
                });
            }
        },
        onBackgroundClick: (envelopeIndex, envelopePart) => (steps) => (event) => {
            const {x, y} = getValuePair(event, event.target);
            const index = steps.findIndex(e => e[0] > x);

            dispatch({
                type: Actions.ENVELOPE_POINT_ADD,
                envelopeIndex,
                envelopePart,
                index,
                x,
                y
            });
        },
        onSustainBackgroundClick: (envelopeIndex) => (event) => {
            const {x, y} = getValuePair(event, event.target);
            dispatch({
                type: Actions.ENVELOPE_SUSTAIN_CHANGE,
                envelopeIndex,
                value: y
            });            
        },
        onCircleMouseDrag: (envelopeIndex, envelopePart, stepCount) => (index, background) => (event) => {
            const {x, y} = getValuePair(event, background);

            if ((envelopePart === "release" && index === 0) || envelopePart === "attack" && index === stepCount - 1) {

                dispatch({
                    type: Actions.ENVELOPE_SUSTAIN_CHANGE,
                    envelopeIndex,
                    envelopePart,
                    value: y
                });
            } else {

                dispatch({
                    type: Actions.ENVELOPE_POINT_CHANGE,
                    envelopeIndex,
                    envelopePart,
                    index,
                    x,
                    y
                });
            }
        },
        onDurationChange: (envelopeIndex, envelopePart) => (event) => {
            dispatch({
                type: Actions.ENVELOPE_DURATION_CHANGE,
                envelopeIndex,
                envelopePart,
                value: parseFloat(event.target.value)
            })
        }
    }
};
const SustainEnvelope = connect(
    null,
    mapDispatchToSustainEnvelopeProps
)(SustainEnvelopePresentation);


class EnvelopesViewPresentation extends Component {
    render () {
        const {patchData, configuration, viewState} = this.props;
        let envelopes = [];

        for (let i = 0; i < configuration.count; i += 1) {
            let patch = patchData[i] || configuration["default"];
            let vs = viewState[i] || {attack: [], release: []};
            envelopes.push(<SustainEnvelope key={i} index={i} patch={patch} viewState={vs} />);
        }

        return <div>{envelopes}</div>;
    }
}
const mapStateToEnvelopesProps = (state) => {
    return {
        patchData: state.patch.envelope,
        configuration: state.settings.modulation.source.envelope,
        viewState: state.viewState.envelope
    };
};
const EnvelopesView = connect(
    mapStateToEnvelopesProps,
    null
)(EnvelopesViewPresentation);

/*
    this.controller.addEventListener('mousemove', this.mouseHandler.bind(this), false);
    this.controller.addEventListener('touchstart', this.touchHandler.bind(this), false);
    this.controller.addEventListener('touchend', this.touchHandler.bind(this), false);
    this.controller.addEventListener('touchcancel', this.touchHandler.bind(this), false);
    this.controller.addEventListener('touchmove', this.touchHandler.bind(this), false);
};

EnvelopeView.prototype.changeHandler = function (event, touch) {
    var pixelCoordinates,
        svgSize,
        newData,
        circleDraggable,
        index,
        i = 0,
        changeEvent;

    switch (event.type) {
    case "touchstart":
    case "touchend":
    case "touchcancel":
    case "mouseup":
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
    case "mousemove":
        if (event.target.tagName === "circle") {
            event.preventDefault();
            event.stopPropagation();
            index = this.circleIndex(event);

            if (this.points[index] && this.points[index].draggable) {
                changeEvent = new CustomEvent(this.envId + '.change.data', {
                    'detail': {
                        'type': 'move',
                        'index': index,
                        'data': newData
                    }
                });

            }
        }
        break;
    }
    if (changeEvent) {
        this.context.dispatchEvent(changeEvent);
    }
    return false;
};

*/
export default EnvelopesView;