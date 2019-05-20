import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import drawWaveform from "./draw-waveform";


class WaveformButton extends PureComponent {

    static propTypes = {
        "controlName": PropTypes.string,
        "includePhaseIndicator": PropTypes.bool,
        "onChange": PropTypes.func.isRequired,
        "selected": PropTypes.bool,
        "waveform": PropTypes.func.isRequired,
        "waveformName": PropTypes.string.isRequired
    }

    constructor (props) {
        super(props);
        this.phaseIndicator = React.createRef();
        this.canvas = React.createRef();
    }

    componentDidMount () {
        drawWaveform(this.props.waveform, this.canvas.current);

        /*
        if (this.props.includePhaseIndicator) {
            const propNames = ["maskImage", "webkitMaskImage"];
            const s = this.phaseIndicator.current.style;

            const maskImageProperty = propNames.find(p => typeof s[p] !== "undefined");

            if (maskImageProperty) {
                this.phaseIndicator.current.style[maskImageProperty] = "url('" + this.canvas.current.toDataURL() + "')";
            } else {
                this.phaseIndicator.classList.add("no-mask");
            }
        }
        */
    }

    componentDidUpdate () {
        drawWaveform(this.props.waveform, this.canvas.current);
    }

    @autobind
    handleChange (event) {
        event.stopPropagation();
        const {selected, onChange, waveformName} = this.props;

        if (event.target.checked && !selected) {
            onChange(waveformName);
        }
    }

    render () {
        const {
            controlName,
            waveformName,
            selected,
            includePhaseIndicator
        } = this.props;

        return (
            <label>
                <input
                    checked={selected}
                    name={controlName + "-selector"}
                    onChange={this.handleChange}
                    type="radio"
                    value={waveformName}
                />
                <canvas
                    height="50px"
                    ref={this.canvas}
                    role="presentation"
                    width="50px"
                />
                {includePhaseIndicator && (
                    <div
                        className="phase-indicator"
                        ref={this.phaseIndicator}
                        role="presentation"
                    />
                )}
                <span className="waveform-name">{waveformName}</span>
            </label>
        );
    }
}


export default WaveformButton;
