import React, {Component, PropTypes} from "react";

import * as PropDefs from "../../proptype-defs";

import Lfo from "./lfo.jsx";


class Lfos extends Component {
    render () {
        const {patch, configuration, handlers, syncHandlers} = this.props;
        let lfos = [];

        for (let i = 0; i < configuration.count; i += 1) {
            lfos.push(
                <Lfo
                    configuration={configuration}
                    handlers={handlers}
                    index={i}
                    key={i}
                    module="lfos"
                    patch={patch[i] || configuration["default"]}
                    syncHandlers={syncHandlers}
                />
            );
        }

        return <div>{lfos}</div>;
    }
}
Lfos.propTypes = {
    "configuration": PropDefs.modulationLfoSources.isRequired,
    "handlers": PropTypes.object.isRequired,
    "patch": PropDefs.lfosPatchData,
    "syncHandlers": PropTypes.object
};


export default Lfos;
