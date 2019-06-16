import React, {Component} from "react";
import PropTypes from "prop-types";
import {boundMethod} from "autobind-decorator";


class HarmonicsPresets extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired
    }

    constructor (props) {
        super(props);
        this.partials = React.createRef();
        this.presetSelector = React.createRef();
    }

    @boundMethod
    handleLoadPreset (event) {
        event.preventDefault();
        event.stopPropagation();

        const partials = parseInt(this.partials.current.value, 10);
        const preset = this.presetSelector.current.value;

        this.props.handlers.preset(preset, partials);
    }

    render () {
        return (
            <form className="harmonics-presets" onSubmit={this.handleLoadPreset}>
                <fieldset className="harmonic-preset">
                    <legend>presets</legend>
                    <select ref={this.presetSelector}>
                        <option value="saw">saw</option>
                        <option value="square">square</option>
                        <option value="triangle">triangle</option>
                    </select>
                    <input defaultValue="5" max="20" min="1" ref={this.partials} type="number" />
                    <button className="harmonics-preset-load" type="submit">load</button>
                </fieldset>
            </form>
        );
    }
}


export default HarmonicsPresets;
