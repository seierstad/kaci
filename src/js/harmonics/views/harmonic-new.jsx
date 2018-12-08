import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {harmonicShape} from "../propdefs";
import {harmonicConfiguration} from "../configuration";

import FractionInput from "../../fraction/views/fraction-input.jsx";


class NewHarmonic extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "patch": PropTypes.arrayOf(harmonicShape).isRequired,
        "validRatio": PropTypes.bool.isRequired
    }

    constructor (props) {
        super(props);
        this.numeratorElement = null;
        this.denominatorElement = null;
    }

    @autobind
    handleAddHarmonic (event) {
        event.preventDefault();
        event.stopPropagation();

        const denominator = parseInt(this.denominatorElement.value, 10);
        const numerator = parseInt(this.numeratorElement.value, 10);

        this.props.handlers.add(numerator, denominator);
    }

    @autobind
    setDenominatorRef (denominator) {
        this.denominatorElement = denominator;
    }

    @autobind
    setNumeratorRef (numerator) {
        this.numeratorElement = numerator;
    }

    render () {
        const {
            handlers,
            viewState,
            validRatio
        } = this.props;

        return (
            <form className="harmonics-new" onSubmit={this.handleAddHarmonic}>
                <fieldset className="harmonic">
                    <legend>new</legend>
                    <FractionInput
                        configuration={harmonicConfiguration}
                        denominatorRef={this.setDenominatorRef}
                        handlers={handlers}
                        module="oscillator"
                        numeratorRef={this.setNumeratorRef}
                        patch={viewState}
                    />
                    {validRatio ? (
                        <button className="harmonics-new-add" type="submit">add</button>
                    ) : null}
                </fieldset>
            </form>
        );
    }
}


export default NewHarmonic;
