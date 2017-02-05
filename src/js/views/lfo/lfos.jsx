import React, {Component, PropTypes} from "react";

import {lfosPatchDataShape, modulationLfoSourcesShape} from "../../propdefs";
import LFO from "./lfo.jsx";

class LFOs extends Component {

    static propTypes = {
        "configuration": modulationLfoSourcesShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": lfosPatchDataShape,
        "syncHandlers": PropTypes.object
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    render () {
        const {patch, configuration, handlers, syncHandlers} = this.props;
        let lfos = [];

        for (let i = 0; i < configuration.count; i += 1) {
            lfos.push(
                <LFO
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


export default LFOs;
