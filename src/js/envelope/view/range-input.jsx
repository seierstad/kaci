import React, {PureComponent} from "react";
import PropTypes from "prop-types";

let index = 0;

class RangeInput extends PureComponent {
    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.string,
        max: PropTypes.number,
        min: PropTypes.number,
        onChange: PropTypes.func.isRequired,
        step: PropTypes.number,
        value: PropTypes.number
    }

    render () {
        const {
            id = "range-input-" + (index += 1),
            label,
            max,
            min,
            onChange,
            step = 0.1,
            value = 0
        } = this.props;

        return (
            <React.Fragment>
                <label htmlFor={id}>{label}</label>
                <input
                    id={id}
                    max={max}
                    min={min}
                    onChange={onChange}
                    onInput={onChange}
                    step={step}
                    type="number"
                    value={value}
                />
            </React.Fragment>
        );
    }
}

export default RangeInput;
