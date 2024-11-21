import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import BlofeldComponent from "../blofeld/views/blofeld.jsx";

class WaldorfSpecific extends Component {

    static propTypes = {
        "handlers": PropTypes.object.isRequired,
        "patch": PropTypes.object.isRequired,
        "viewState": PropTypes.object.isRequired
    }


    render () {
        const {
            viewState: {
                model
            } = {}
        } = this.props;

        let ModelSpecificComponent;

        switch (this.props.viewState.model) {
            case "blofeld":
                ModelSpecificComponent = BlofeldComponent;
                break;

            default:
                ModelSpecificComponent = Fragment;
        }

        return (
            <Fragment>
                Waldorf-spesifikt her
                <ModelSpecificComponent {...this.props}>
                    {this.props.children}
                </ModelSpecificComponent>
            </Fragment>
        );
    }
}

export default WaldorfSpecific;
