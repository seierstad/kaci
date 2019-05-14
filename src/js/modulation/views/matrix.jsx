import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {modulationConfigShape, modulationPatchShape} from "../propdefs";

import {
    AMOUNT_CHANGE,
    POLARITY_CHANGE,
    CONNECTION_TOGGLE
} from "../actions";
import TargetModule from "./module.jsx";


class ModulationMatrixPresentation extends Component {

    static propTypes = {
        /*
        "configuration": modulationConfigShape.isRequired,
        "handlers": PropTypes.object,
        "patch": modulationPatchShape.isRequired
        */
    }

    render () {
        const {configuration, patch, handlers} = this.props;
        const lfoCount = configuration.source.lfo.count;
        const morseCount = configuration.source.morse.count;
        const stepsCount = configuration.source.steps.count;
        const envCount = configuration.source.envelope.count;


        const sourceNumbers = [];
        for (let i = 0; i < lfoCount; i += 1) {
            sourceNumbers.push(<th key={"lfo" + i} scope="col">{i + 1}</th>);
        }
        for (let i = 0; i < morseCount; i += 1) {
            sourceNumbers.push(<th key={"morse" + i} scope="col">{i + 1}</th>);
        }
        for (let i = 0; i < stepsCount; i += 1) {
            sourceNumbers.push(<th key={"step" + i} scope="col">{i + 1}</th>);
        }
        for (let i = 0; i < envCount; i += 1) {
            sourceNumbers.push(<th key={"env" + i} scope="col">{i + 1}</th>);
        }

        return (
            <section className="modulation" >
                <h2>Modulation</h2>
                <table className="modulation-matrix">
                    <colgroup>
                        {[2, lfoCount, morseCount, stepsCount, envCount + 1].map((colSpan, index) => <col key={index} span={colSpan} />)}
                    </colgroup>
                    <thead>
                        <tr>
                            <td colSpan="2" rowSpan="2" scope="col" />
                            <th colSpan={lfoCount} scope="colspan">LFO</th>
                            <th colSpan={morseCount} scope="colspan">Morse</th>
                            <th colSpan={stepsCount} scope="colspan">Steps</th>
                            <th colSpan={envCount + 1} scope="colspan">Envelope</th>
                        </tr>
                        <tr>
                            {sourceNumbers}
                            <th scope="col">gate</th>
                        </tr>
                    </thead>
                    {Object.keys(configuration.target).map(module => (
                        <TargetModule
                            configuration={configuration.target[module]}
                            envCount={envCount}
                            handlers={handlers}
                            key={module}
                            lfoCount={lfoCount}
                            module={module}
                            morseCount={morseCount}
                            patch={patch[module]}
                            stepsCount={stepsCount}
                        />
                    ))}
                </table>
            </section>
        );
    }
}


const mapDispatch = (dispatch) => ({
    "handlers": {
        "changeAmount": (module, parameter, source, index, value) => {
            dispatch({"type": AMOUNT_CHANGE, source, index, module, parameter, value});
        },
        "changePolarity": (module, parameter, source, index, value) => {
            dispatch({"type": POLARITY_CHANGE, source, index, module, parameter, value});
        },
        "toggle": (module, parameter, source, index) => {
            dispatch({"type": CONNECTION_TOGGLE, source, index, module, parameter});
        }
    }
});

const ModulationMatrix = connect(null, mapDispatch)(ModulationMatrixPresentation);


export default ModulationMatrix;
