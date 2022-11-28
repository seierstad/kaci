import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import Parameters from "./parameters.jsx";
import SysexFileLink from "./sysex-file-link.jsx";

class Blofeld extends Component {

    static propTypes = {
        "handlers": PropTypes.object.isRequired,
        "patch": PropTypes.object.isRequired,
        "viewState": PropTypes.object.isRequired
    }


    render () {
        const {
            viewState: {
                deviceId,
                name,
                slot,
                result: wavetable
            } = {}
        } = this.props;

        return (
            <Fragment>
                Blofeld-spesifikt her
                <Parameters {...this.props} />
                {this.props.children}
                <SysexFileLink deviceId={deviceId} name={name} slot={slot} wavetable={wavetable} />
            </Fragment>
        );
    }
}

export default Blofeld;
