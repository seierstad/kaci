import React, {Component} from "react";
import RangeInput from "./RangeInput.jsx";

class SubView extends Component {
    render () {
        const {patch, configuration, handlers} = this.props;
        const {panInput, gainInput, toggle, depthChange} = handlers;


        return (
            <section className="sub-view">
                <h1>Sub oscillator</h1>
                <input
                    checked={patch.active}
                    onChange={toggle}
                    type="checkbox"
                />
                <RangeInput
                    changeHandler={gainInput}
                    label="Sub gain"
                    max={configuration.gain.max}
                    min={configuration.gain.min}
                    step={0.01}
                    value={patch.gain}
                />
                <RangeInput
                    changeHandler={panInput}
                    label="Sub pan"
                    max={configuration.pan.max}
                    min={configuration.pan.min}
                    step={0.01}
                    value={patch.pan}
                />
                <fieldset>
                    <legend>Sub depth</legend>
                    <input
                        hecked={patch.depth === 0}
                        id="sub-0"
                        name="sub-depth-selector"
                        onChange={depthChange}
                        type="radio"
                        value={0}
                    />
                    <input
                        checked={patch.depth === -1}
                        id="sub-1"
                        name="sub-depth-selector"
                        onChange={depthChange}
                        type="radio"
                        value={-1}
                    />
                    <input
                        checked={patch.depth === -2}
                        id="sub-2"
                        name="sub-depth-selector"
                        onChange={depthChange}
                        type="radio"
                        value={-2}
                    />
                </fieldset>
            </section>
        );
    }
}

export default SubView;
