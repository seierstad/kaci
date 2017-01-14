import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import {modulationShape, modulationPatchDataShape, modulationSourceTypeShape} from "../../propdefs";

import {MODULATION_AMOUNT_CHANGE, MODULATION_POLARITY_CHANGE, MODULATION_CONNECTION_TOGGLE} from "../../actions";
import TargetModule from "./module.jsx";


class ModulationMatrixPresentation extends Component {

    render () {
        const {configuration, patch, handlers} = this.props;
        const lfoCount = configuration.source.lfos.count;
        const envCount = configuration.source.envelopes.count;

        const sourceNumbers = [];
        for (let i = 0; i < lfoCount; i += 1) {
            sourceNumbers.push(<th key={"lfo" + i} scope="col">{i + 1}</th>);
        }
        for (let i = 0; i < envCount; i += 1) {
            sourceNumbers.push(<th key={"env" + i} scope="col">{i + 1}</th>);
        }
/*
        const pickModuleData = (module) => (e) => {
            const result = {};
            const prefix = module + ".";
            const keys = Object.keys(e).filter(k => k.indexOf(prefix) !== -1).forEach(key => result[key] = e[key]);
            return result;
        };

        const modulePatchData = (module) => ({
            "envelopes": patch.envelopes.map(pickModuleData(module)),
            "lfos": patch.lfos.map(pickModuleData(module))
        });
*/
        return (
            <section className="modulation" >
                <h2>Modulation</h2>
                <table className="modulation-matrix">
                    <colgroup>
                        {[2, lfoCount, envCount + 1].map((colSpan, index) => <col key={index} span={colSpan} />)}
                    </colgroup>
                    <thead>
                        <tr>
                            <td colSpan="2" rowSpan="2" scope="col" />
                            <th colSpan={lfoCount} scope="colspan">LFO</th>
                            <th colSpan={envCount + 1} scope="colspan">Envelope</th>
                        </tr>
                        <tr>
                            {sourceNumbers}
                            <th scope="col">none</th>
                        </tr>
                    </thead>
                    {Object.keys(configuration.target).map((module, i) => (
                        <TargetModule
                            envCount={envCount}
                            handlers={handlers}
                            key={i}
                            lfoCount={lfoCount}
                            module={module}
                            patch={patch[module]}
                            targetConfig={configuration.target[module]}
                        />
                    ))}
                </table>
            </section>
        );
    }
}
ModulationMatrixPresentation.propTypes = {
    "configuration": modulationShape.isRequired,
    "handlers": PropTypes.object,
    "patch": modulationPatchDataShape.isRequired
};

const mapState = (state) => ({
    "configuration": state.settings.modulation,
    "patch": state.patch.modulation
});

const mapDispatch = (dispatch) => ({
    "handlers": {
        "amountChange": (value, sourceType, index, module, parameter) => {
            dispatch({"type": MODULATION_AMOUNT_CHANGE, sourceType, index, module, parameter, value});
        },
        "polarityChange": (value, sourceType, index, module, parameter) => {
            dispatch({"type": MODULATION_POLARITY_CHANGE, sourceType, index, module, parameter, value});
        },
        "toggle": (sourceType, index, module, parameter) => {
            dispatch({"type": MODULATION_CONNECTION_TOGGLE, sourceType, index, module, parameter});
        }
    }
});

const ModulationMatrix = connect(mapState, mapDispatch)(ModulationMatrixPresentation);


export default ModulationMatrix;
