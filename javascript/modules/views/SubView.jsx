import React, {Component} from "react";
import RangeInput from "./RangeInput.jsx";

class SubView extends Component {
    render () {
        const {patch, configuration, handlers} = this.props;
        const {panInput, gainInput, toggle, depthChange} = handlers; 


        return (
            <section className="sub-view">
                <h1>Sub oscillator</h1>
                <input type="checkbox" onChange={toggle} checked={patch.active} />
                <RangeInput 
                    label="Sub gain" 
                    min={configuration.gain.min}
                    max={configuration.gain.max}
                    step={0.01}
                    onChange={gainInput}
                    onInput={gainInput}
                    value={patch.gain} />
                <RangeInput 
                    label="Sub pan" 
                    min={configuration.pan.min}
                    max={configuration.pan.max}
                    step={0.01}
                    onChange={panInput}
                    onInput={panInput}
                    value={patch.pan} />
                <fieldset>
                    <legend>Sub depth</legend>
                    <input type="radio" name="sub-depth-selector" onChange={depthChange} value={0} id="sub-0" checked={patch.depth === 0} />
                    <input type="radio" name="sub-depth-selector" onChange={depthChange} value={-1} id="sub-1" checked={patch.depth === -1} />
                    <input type="radio" name="sub-depth-selector" onChange={depthChange} value={-2} id="sub-2" checked={patch.depth === -2} />
                </fieldset>
            </section>
        );
    }
}

export default SubView;
