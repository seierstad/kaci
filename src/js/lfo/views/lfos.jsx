import React, {Component} from "react";
import PropTypes from "prop-types";

import {lfoConfigShape, lfosPatchShape} from "../propdefs";
import Lfo from "./lfo.jsx";


class LFOs extends Component {

    static propTypes = {
        "configuration": lfoConfigShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": lfosPatchShape
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    render () {
        const {patch, configuration, handlers} = this.props;
        let lfos = [];

        for (let i = 0; i < configuration.count; i += 1) {
            lfos.push(
                <Lfo
                    configuration={configuration}
                    handlers={handlers}
                    includeSync={i > 0 ? true : null}
                    index={i}
                    key={i}
                    module="lfos"
                    patch={patch[i] || configuration["default"]}
                    syncHandlers={handlers.sync}
                />
            );
        }

        return <div className="lfos">{lfos}</div>;
    }
}


export default LFOs;
