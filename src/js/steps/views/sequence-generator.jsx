import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import {boundMethod} from "autobind-decorator";

import {generatorDescriptors} from "../sequence-generator-functions";

class SequenceGeneratorView extends PureComponent {

    static propTypes = {
        "onSelect": PropTypes.func.isRequired,
        "onSubmit": PropTypes.func.isRequired,
        "viewState": PropTypes.object
    }

    @boundMethod
    handleSubmit (event) {
        event.stopPropagation();
        event.preventDefault();
        const formData = Array.from(new FormData(event.target).entries()).reduce((acc, [key, value]) => ({...acc, [key]: value}), {});

        const {
            generatorName,
            normalize,
            ...generatorParameters
        } = formData;

        this.props.onSubmit(generatorName, generatorParameters, normalize);
    }

    @boundMethod
    handleSelect (event) {
        this.props.onSelect(event.target.value);
    }

    render () {
        const {
            viewState: {
                selectedGenerator = ""
            } = {}
        } = this.props;

        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    <span className="label-text">function</span>
                    <select name="generatorName" onChange={this.handleSelect} value={selectedGenerator}>
                        <option key="placeholder" value="">select function</option>
                        {generatorDescriptors.map(({label, name}) => (<option key={name} value={name}>{label}</option>))}
                    </select>
                </label>
                <label>
                    <span className="label-text">normalize result</span>
                    <input name="normalize" type="checkbox" />
                </label>
                {(selectedGenerator !== "") && (
                    <fieldset>
                        <legend>parameters</legend>
                        {generatorDescriptors.find(gen => gen.name === selectedGenerator).parameters.map(param => (
                            <label key={param.name}>
                                <span className="label-text">{param.label}</span>
                                {param.type === "number" && (
                                    <input
                                        defaultValue={param.defaultValue}
                                        max={param.maxValue}
                                        min={param.minValue}
                                        name={param.name}
                                        type={param.type}
                                    />
                                )}
                                {param.type === "enumeration" && (
                                    <select defaultValue={param.defaultValue} name={param.name}>
                                        {param.values.map(value => (
                                            <option key={value} value={value}>{value}</option>
                                        ))}
                                    </select>
                                )}
                                {param.type === "checkbox" && (
                                    <input defaultValue={param.defaultValue} name={param.name} type="checkbox" />
                                )}
                            </label>
                        ))}
                    </fieldset>
                )}
                <button type="submit">generate</button>
            </form>
        );
    }
}

export default SequenceGeneratorView;
