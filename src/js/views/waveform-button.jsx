import React, {Component} from "react"; import PropTypes from "prop-types";
import drawWaveform from "./drawWaveform";


class WaveformButton extends Component {

    static propTypes = {
        "controlName": PropTypes.string,
        "includePhaseIndicator": PropTypes.bool,
        "index": PropTypes.number,
        "module": PropTypes.string.isRequired,
        "onChange": PropTypes.func.isRequired,
        "selected": PropTypes.bool,
        "waveform": PropTypes.func.isRequired,
        "waveformName": PropTypes.string.isRequired
    }

    constructor () {
        super();
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount () {
        drawWaveform(this.props.waveform, this.canvas);

        if (this.props.includePhaseIndicator) {
            const propNames = ["maskImage", "webkitMaskImage"];
            const s = this.phaseIndicator.style;

            const maskImageProperty = propNames.find(p => typeof s[p] !== "undefined");

            if (maskImageProperty) {
                this.phaseIndicator.style[maskImageProperty] = "url('" + this.canvas.toDataURL() + "')";
            } else {
                this.phaseIndicator.classList.add("no-mask");
            }
        }
    }

    shouldComponentUpdate (nextProps) {
        return nextProps.selected !== this.props.selected;
    }

    handleChange (event) {
        event.stopPropagation();
        const {selected, onChange, waveformName} = this.props;

        if (event.target.checked && !selected) {
            onChange(waveformName);
        }
    }

    render () {
        const {controlName, waveformName, selected, includePhaseIndicator} = this.props;

        return (
            <label>
                <input
                    checked={selected}
                    name={controlName + "-selector"}
                    onChange={this.handleChange}
                    type="radio"
                    value={waveformName}
                />
                <canvas height="50px" ref={c => this.canvas = c} role="presentation" width="50px" />
                {includePhaseIndicator ? (
                    <div
                        className="phase-indicator"
                        ref={p => this.phaseIndicator = p}
                        role="presentation"
                    />)
                    : null
                }
                <span className="waveform-name">{waveformName}</span>
            </label>
        );
    }
}


export default WaveformButton;
