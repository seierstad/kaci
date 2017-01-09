import React, {Component, PropTypes} from "react";

import {modulationShape, modulationPatchDataShape, modulationSourceTypeShape} from "../propdefs";

import RangeInput from "./RangeInput.jsx";

const arr = (count) => (new Array(count)).fill(0);

class PolaritySelector extends Component {
    render () {
        const {changeHandler, prefix, patch} = this.props;
        return (
            <div>
                <select id={prefix + "-polarity"} onChange={changeHandler} value={patch}>
                    {
                        [
                            { value: "positive", label: "+", title: "positive"},
                            { value: "full", label: "±", title: "full"},
                            { value: "negative", label: "-", title: "negative"}
                        ].map((item, i) => <option key={i} title={item.title} value={item.value}>{item.label}</option>)
                    }
                </select>
                <label htmlFor={prefix + "-polarity"}>polarity</label>
            </div>
        );
    }
}


class Connection extends Component {
    constructor () {
        super();
        this.amountChangeEnvelope = this.amountChangeEnvelope.bind(this);
        this.amountChangeLfo = this.amountChangeLfo.bind(this);
        this.polarityChangeEnvelope = this.polarityChangeEnvelope.bind(this);
        this.polarityChangeLfo = this.polarityChangeLfo.bind(this);
        this.toggleEnvelope = this.toggleEnvelope.bind(this);
        this.toggleLfo = this.toggleLfo.bind(this);
    }
    amountChangeEnvelope (value) {
        const {handlers, index, module, parameter} = this.props;
        handlers.amountChange(value, "envelope", index, module, parameter);
    }
    amountChangeLfo (value) {
        const {handlers, index, module, parameter} = this.props;
        handlers.amountChange(value, "lfo", index, module, parameter);
    }
    polarityChangeEnvelope (value) {
        const {handlers, index, module, parameter} = this.props;
        handlers.polarityChange(value, "envelope", index, module, parameter);
    }
    polarityChangeLfo (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.polarityChange(event.target.value, "lfo", index, module, parameter);
    }
    toggleEnvelope () {
        const {handlers, index, module, parameter} = this.props;
        handlers.toggle("envelope", index, module, parameter);
    }
    toggleLfo () {
        const {handlers, index, module, parameter} = this.props;
        handlers.toggle("lfo", index, module, parameter);
    }

    render () {
        const {type, index, module, parameter, patch, handlers, noConnection} = this.props;
        const prefix = [type, index, module, parameter].join("-");
        const id = prefix + "-connection";
        const target = module + "." + parameter;
        const checked = patch[type] &&
                        patch[type][index] &&
                        patch[type][index].hasOwnProperty(target) &&
                        patch[type][index][target].enabled
                        ||
                        index === null && noConnection;

        let polarity;
        let amount;
        let name = [type, module, parameter].join("-") + "-connection";

        polarity = patch && patch[type] && patch[type][index] && patch[type][index][target] && patch[type][index][target].polarity || "full";
        amount = patch && patch[type] && patch[type][index] && patch[type][index][target] && patch[type][index][target].amount || 0;

        const isLFO = type === "lfos";

        return (
            <td>
                <label htmlFor={id}>connect {type + " " + index + " to " + module + " " + parameter}</label>
                <input
                    checked={checked}
                    id={id}
                    name={isLFO ? null : name}
                    onChange={isLFO ? this.toggleLfo : this.toggleEnvelope}
                    type={isLFO ? "checkbox" : "radio"}
                />
                {index !== null ?
                    <PolaritySelector
                        changeHandler={isLFO ? this.polarityChangeLfo : this.polarityChangeEnvelope}
                        patch={polarity}
                        prefix={prefix}
                    />
                : null}
                {index !== null ?
                    <RangeInput
                        changeHandler={isLFO ? this.amountChangeLfo : this.amountChangeEnvelope}
                        label="amount"
                        max={1}
                        min={0}
                        step={0.01}
                        value={amount}
                    />
                : null}
            </td>
        );
    }
}
Connection.propTypes = {
    "handlers": PropTypes.object,
    "index": PropTypes.number.isRequired,
    "module": PropTypes.string.isRequired,
    "noConnection": PropTypes.bool,
    "parameter": PropTypes.string.isRequired,
    "patch": modulationPatchDataShape.isRequired,
    "type": modulationSourceTypeShape.isRequired
};

class Target extends Component {
    render () {
        const {module, moduleParameterCount, patch, handlers, lfoCount, envCount, firstInModule, parameter} = this.props;

        const target = module + "." + parameter;
        const noConnection = !patch.envelopes ||
                             !(patch.envelopes.some(env => env.hasOwnProperty(target) && env[target].enabled));


        return (
            <tr>
                {firstInModule ?
                    <th rowSpan={moduleParameterCount} scope="rowgroup"><span>{module}</span></th>
                : null }
                <th scope="row">{parameter}</th>

                {arr(lfoCount).map((a, i) => <Connection
                    handlers={handlers}
                    index={i}
                    key={i}
                    module={module}
                    parameter={parameter}
                    patch={patch}
                    type="lfos"
                />)}
                {arr(envCount).map((a, i) => <Connection
                    handlers={handlers}
                    index={i}
                    key={i}
                    module={module}
                    parameter={parameter}
                    patch={patch}
                    type="envelopes"
                />)}
                {envCount > 0 ?
                    <Connection
                        handlers={handlers}
                        index={-1}
                        key={envCount}
                        module={module}
                        noConnection={noConnection}
                        parameter={parameter}
                        patch={patch}
                        type="envelopes"
                    />
                : null}
            </tr>
        );
    }
}

class ModuleTargets extends Component {
    render () {
        const {module, targetConfig, patch, lfoCount, envCount, handlers} = this.props;
        const parameters = Object.keys(targetConfig);
        return (
            <tbody>
                {parameters.map((parameter, index) => <Target
                    envCount={envCount}
                    firstInModule={index === 0}
                    handlers={handlers}
                    key={index}
                    lfoCount={lfoCount}
                    module={module}
                    moduleParameterCount={parameters.length}
                    parameter={parameter}
                    patch={patch}
                />)}
            </tbody>
        );
    }
}

class ModulationMatrix extends Component {

    render () {
        const {configuration, patch, handlers} = this.props;
        const lfoCount = configuration.source.lfos.count;
        const envCount = configuration.source.envelopes.count;

        return (
            <section className="modulation" >
                <h2>Modulation</h2>
                <table className="modulation-matrix">
                    <colgroup>
                        {[2, lfoCount, envCount + 1].map((colSpan, index) => <col key={index} span={colSpan} />)}
                    </colgroup>
                    <thead>
                        <tr>
                            <td
                                colSpan="2"
                                rowSpan="2"
                                scope="col"
                            />
                            <th
                                colSpan={lfoCount}
                                scope="colspan"
                            >LFO</th>
                            <th
                                colSpan={envCount + 1}
                                scope="colspan"
                            >Envelope</th>
                        </tr>
                        <tr>
                            {arr(lfoCount).map((z, i) => <th key={"lfo" + i} scope="col">{i + 1}</th>)}
                            {arr(envCount).map((z, i) => <th key={"env" + i} scope="col">{i + 1}</th>)}
                            <th scope="col">none</th>
                        </tr>
                    </thead>
                    {Object.keys(configuration.target).map((module, i) => <ModuleTargets
                        envCount={envCount}
                        handlers={handlers}
                        key={i}
                        lfoCount={lfoCount}
                        module={module}
                        patch={patch}
                        targetConfig={configuration.target[module]}
                                                                          />
                    )}
                </table>
            </section>
        );
    }
}
ModulationMatrix.propTypes = {
    "configuration": modulationShape.isRequired,
    "handlers": PropTypes.object,
    "patch": PropTypes.object
};

export default ModulationMatrix;
