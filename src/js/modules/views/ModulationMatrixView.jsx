import React, {Component} from "react";

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
                            { value: "full",     label: "±", title: "full"},
                            { value: "negative", label: "-", title: "negative"}
                        ].map((item, i) => <option key={i} value={item.value} title={item.title}>{item.label}</option>)
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
    amountChangeEnvelope (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.amountChange(event, "envelope", index, module, parameter);
    }
    amountChangeLfo (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.amountChange(event, "lfo", index, module, parameter);
    }
    polarityChangeEnvelope (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.polarityChange(event, "envelope", index, module, parameter);
    }
    polarityChangeLfo (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.polarityChange(event, "lfo", index, module, parameter);
    }
    toggleEnvelope (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.toggle(event, "envelope", index, module, parameter);
    }
    toggleLfo (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.toggle(event, "lfo", index, module, parameter);
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
        let name = [type, module, parameter].join("-") + "-connection"

        polarity = patch && patch[type] && patch[type][index] && patch[type][index][target] && patch[type][index][target].polarity || "full";
        amount = patch && patch[type] && patch[type][index] && patch[type][index][target] && patch[type][index][target].amount || 0;

        const isLFO = type === "lfos";

        return (
            <td>
                <label htmlFor={id}>connect {type + " " + index + " to " + module + " " + parameter}</label>
                <input
                    type={isLFO ? "checkbox" : "radio"}
                    checked={checked}
                    onChange={isLFO ? this.toggleLfo : this.toggleEnvelope}
                    id={id}
                    name={isLFO ? null : name}
                    />
                {index !== null ?
                    <PolaritySelector
                        prefix={prefix}
                        patch={polarity}
                        changeHandler={isLFO ? this.polarityChangeLfo : this.polarityChangeEnvelope}
                        />
                : null}
                {index !== null ?
                    <RangeInput
                        label="amount"
                        min={0}
                        max={1}
                        step={0.01}
                        changeHandler={isLFO ? this.amountChangeLfo : this.amountChangeEnvelope}
                        value={amount}
                        />
                : null}
            </td>
        )
    }
}


class Target extends Component {
    render () {
        const {module, moduleParameterCount, patch, handlers, lfoCount, envCount, firstInModule, parameter} = this.props;

        const target = module + "." + parameter;
        const noConnection = !patch.envelopes ||
                             !(patch.envelopes.some(env => env.hasOwnProperty(target) && env[target].enabled));


        return (
            <tr>
                {firstInModule ?
                    <th scope="rowgroup" rowSpan={moduleParameterCount}><span>{module}</span></th>
                : null }
                <th scope="row">{parameter}</th>

                {arr(lfoCount).map((a, i) => <Connection
                    key={i}
                    type="lfos"
                    index={i}
                    module={module}
                    parameter={parameter}
                    patch={patch}
                    handlers={handlers}
                    />
                )}
                {arr(envCount).map((a, i) => <Connection
                    key={i}
                    type="envelopes"
                    index={i}
                    module={module}
                    parameter={parameter}
                    patch={patch}
                    handlers={handlers}
                    />
                )}
                {envCount > 0 ?
                    <Connection
                        key={envCount}
                        type="envelopes"
                        index={null}
                        module={module}
                        parameter={parameter}
                        patch={patch}
                        handlers={handlers}
                        noConnection={noConnection}
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
                    patch={patch}
                    firstInModule={index === 0}
                    module={module}
                    moduleParameterCount={parameters.length}
                    lfoCount={lfoCount}
                    envCount={envCount}
                    parameter={parameter}
                    key={index}
                    handlers={handlers}
                    />
                )}
            </tbody>
        );
    }
}

class ModulationMatrix extends Component {

    render() {
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
                            <td scope="col" colSpan="2" rowSpan="2" />
                            <th scope="colspan" colSpan={lfoCount}>LFO</th>
                            <th scope="colspan" colSpan={envCount + 1}>Envelope</th>
                        </tr>
                        <tr>
                            {arr(lfoCount).map((z, i) => <th key={"lfo" + i} scope="col">{i + 1}</th>)}
                            {arr(envCount).map((z, i) => <th key={"env" + i} scope="col">{i + 1}</th>)}
                            <th scope="col">none</th>
                        </tr>
                    </thead>
                    {Object.keys(configuration.target).map((module, i) => <ModuleTargets
                        patch={patch}
                        key={i}
                        handlers={handlers}
                        module={module}
                        targetConfig={configuration.target[module]}
                        lfoCount={lfoCount}
                        envCount={envCount}
                        />
                    )}
                </table>
            </section>
        );
    }
}

export default ModulationMatrix;
