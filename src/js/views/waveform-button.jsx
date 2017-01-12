import React, {Component, PropTypes} from "react";
import drawWaveform from "./drawWaveform";


class WaveformButton extends Component {
    constructor () {
        super();
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount () {
        drawWaveform(this.props.waveform, this.canvas);
    }

    handleChange (event) {
        const {onChange, module, index, waveformName} = this.props;
        event.stopPropagation();
        onChange(waveformName);
    }

    render () {
        const {controlName, waveformName, selected} = this.props;

        return (
            <label>
                <input
                    checked={selected}
                    name={controlName + "-selector"}
                    onChange={this.handleChange}
                    type="radio"
                    value={waveformName}
                />
                <canvas height="50px" ref={c => this.canvas = c} width="50px" />
                <span className="waveform-name">{waveformName}</span>
            </label>
        );
    }
}
WaveformButton.propTypes = {
    "controlName": PropTypes.string,
    "index": PropTypes.number,
    "module": PropTypes.string.isRequired,
    "onChange": PropTypes.func.isRequired,
    "selected": PropTypes.bool,
    "waveform": PropTypes.func.isRequired,
    "waveformName": PropTypes.string.isRequired
};

export default WaveformButton;
