import React, {Component, PropTypes} from "react";

import * as PropDef from "../../proptype-defs";

import TargetModule from "./modulation-target-module.jsx";


class ModulationMatrix extends Component {

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

        return (
            <section className="modulation">
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
                            patch={patch}
                            targetConfig={configuration.target[module]}
                        />
                    ))}
                </table>
            </section>
        );
    }
}

ModulationMatrix.propTypes = {
    "configuration": PropDef.configuration.isRequired,
    "handlers": PropTypes.object,
    "patch": PropTypes.object
};

export default ModulationMatrix;
