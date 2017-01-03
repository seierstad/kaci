import drawWaveform from './drawWaveform';
import React, {Component, PropTypes} from "react";

let waveformSelectorCounter = 0;

class WaveformButton extends Component {
    constructor () {
        super();
        this.changeHandler = this.changeHandler.bind(this);
    }
    changeHandler (event) {
        const {changeHandler, module, index} = this.props;
        changeHandler(event, module, index);
    }
    render () {
        const {controlName, waveformName, waveform, selected} = this.props;

        return (
            <label>
                <input type="radio" checked={selected} onChange={this.changeHandler} name={controlName + "-selector"} value={waveformName} />
                <canvas ref={c => this.canvas = c} width="50px" height="50px" />
                <span className="waveform-name">{waveformName}</span>
            </label>
        );
    }
    componentDidMount() {
        drawWaveform(this.props.waveform, this.canvas);
    }
}


class WaveformSelector extends Component {
    render () {
        const {waveforms, selected, changeHandler, index, module} = this.props;
        const controlName = "waveform-" + (waveformSelectorCounter++);
        const sampleAndHoldBuffer = {
            "value": null,
            "phase": 0
        };

        return (
            <fieldset className="waveform-selector">
                <legend>waveform</legend>
                {Object.keys(waveforms).map(
                    w => <WaveformButton
                            key={w}
                            index={index}
                            module={module}
                            controlName={controlName}
                            waveformName={w}
                            changeHandler={changeHandler}
                            selected={selected === w}
                            waveform={w === "sampleAndHold" ? (phase) => waveforms[w](phase, sampleAndHoldBuffer, 4) : waveforms[w]}
                        />
                )}
            </fieldset>
        );
    }
}
WaveformSelector.propTypes = {
    changeHandler: PropTypes.func.isRequired,
    waveforms: PropTypes.objectOf(PropTypes.func).isRequired,
    module: PropTypes.string,
    index: PropTypes.number,
    selected: PropTypes.string
}

export default WaveformSelector;

