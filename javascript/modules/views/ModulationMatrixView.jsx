import React, {Component} from "react";
import {connect} from "react-redux";

import RangeInput from "./RangeInput.jsx";
import * as Actions from "../Actions.jsx";

const arr = (count) => (new Array(count)).fill(0); 

class PolaritySelector extends Component {
    render () {
        const {onInput, prefix, patch} = this.props;
        return (
            <div>
                <select id={prefix + "-polarity"} onInput={onInput} value={patch}>
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



class ConnectionPresentation extends Component {
    render () {
        const {type, index, module, parameter, patch, onAmountInput, onPolarityInput, onToggle} = this.props;
        const prefix = [type, index, module, parameter].join("-");
        const id = prefix + "-connection";
        const target = module + "." + parameter;
        const checked = patch[type] && patch[type][index] && patch[type][index].hasOwnProperty(target);

        let polarity;
        let amount;
        let name = [type, module, parameter].join("-") + "-connection"


        if (checked) {
            polarity = patch[type][index][target].polarity;
            amount = patch[type][index][target].amount;
        }
        let toggle;

        if (type === "lfos") {
            toggle = <input type="checkbox" checked={checked} onChange={onToggle(type, index, module, parameter)} id={id} />;
        } else {
            toggle = <input type="radio" checked={checked} onChange={onToggle(type, index, module, parameter)} id={id} name={name} />;
        }

        return (
            <td>
                <label htmlFor={id}>connect {type + " " + index + " to " + module + " " + parameter}</label>
                {toggle}
                <PolaritySelector prefix={prefix} patch={polarity} onInput={onPolarityInput(type, index, module, parameter)} />
                <RangeInput 
                    label="amount" 
                    min={0}
                    max={1}
                    step={0.01}
                    onInput={onAmountInput(type, index, module, parameter)}
                    value={amount} />

            </td>
        );
    }
}
const mapStateToConnectionProps = (state) => {
    return {
        patch: state.patch.modulation
    };
}
const mapDispatchToConnectionProps = (dispatch) => {
    return {
        onAmountInput: (sourceType, index, module, parameter) => (event) => {
            dispatch({"type": Actions.MODULATION_AMOUNT_CHANGE, sourceType, index, module, parameter, value: parseFloat(event.target.value)});
        },
        onPolarityInput: (sourceType, index, module, parameter) => (event) => {
            dispatch({"type": Actions.MODULATION_POLARITY_CHANGE, sourceType, index, module, parameter, value: event.target.value});
        }
    }
}
const Connection = connect(mapStateToConnectionProps, mapDispatchToConnectionProps)(ConnectionPresentation);

class TargetPresentation extends Component {
    render () {
        const {module, moduleLength, index, parameter, configuration, onConnectionToggle} = this.props;

        const lfoCount = configuration.source.lfos.count;
        const envCount = configuration.source.envelopes.count;

        return (
            <tr>
                {index === 0 ?
                    <th scope="rowgroup" rowSpan={moduleLength}><span>{module}</span></th>
                : null }
                <th scope="row">{parameter}</th>

                {arr(lfoCount).map(
                    (a, i) => <Connection 
                                key={i} 
                                type="lfos" 
                                index={i} 
                                module={module} 
                                parameter={parameter} 
                                onToggle={onConnectionToggle} />
                    )}
                {arr(envCount).map(
                    (a, i) => <Connection 
                                key={i} 
                                type="envelopes" 
                                index={i} 
                                module={module} 
                                parameter={parameter} 
                                onToggle={onConnectionToggle} />
                )}
                <td>
                    <input 
                        type="radio" 
                        name={["envelope", module, parameter].join("-") + "-connection"}
                        id={["envelope", "none", module, parameter].join("-") + "-connection"}
                        onChange={onConnectionToggle("envelope", null, module, parameter)}
                    />
                </td>
            </tr>
        );
    }
}
const mapStateToTargetProps = (state) => {
    return {
        configuration: state.settings.modulation
    }
}
const mapDispatchToTargetProps = (dispatch) => {
    return {
        onConnectionToggle: (sourceType, index, module, parameter) => () => {
            dispatch({"type": Actions.MODULATION_CONNECTION_TOGGLE, sourceType, index, module, parameter});
        }
    }
}
const Target = connect(mapStateToTargetProps, mapDispatchToTargetProps)(TargetPresentation);

class ModuleTargetsPresentation extends Component {
    render () {
        const {module, configuration} = this.props;
        const moduleConfig = configuration.target[module];
        const parameters = Object.keys(moduleConfig);
        return (
            <tbody>
                {parameters.map((parameter, index, parameters) => <Target module={module} index={index} moduleLength={parameters.length} parameter={parameter} key={index} />)}
            </tbody>
        );
    }
}
const mapStateToModuleProps = (state) => {
    return {
        configuration: state.settings.modulation
    };
}
const ModuleTargets = connect(mapStateToModuleProps, null)(ModuleTargetsPresentation);


class ModulationMatrixPresentation extends Component {

    render() {
        const {configuration, patch} = this.props;
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
                            {arr(lfoCount).map((z, i) => <th key={"lfo" + i} scope="col">{i}</th>)}
                            {arr(envCount).map((z, i) => <th key={"env" + i} scope="col">{i}</th>)}
                            <th scope="col">none</th>
                        </tr>
                    </thead>
                    {Object.keys(configuration.target).map((module, i) => <ModuleTargets key={i} module={module} />)}
                </table>
            </section>
        );
    }
}

const mapStateToMMProps = (state) => {
    return {
        configuration: state.settings.modulation,
        patch: state.patch.modulation
    }
}
const ModulationMatrix = connect(mapStateToMMProps, null)(ModulationMatrixPresentation);

export default ModulationMatrix;