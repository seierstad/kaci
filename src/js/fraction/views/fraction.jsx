import React, {Component} from "react";
import PropTypes from "prop-types";

import {
    UNICODE_FRACTION,
    UNICODE_FRACTIONAL_SLASH,
    UNICODE_SUPERSCRIPT,
    UNICODE_SUBSCRIPT
} from "../constants";
import {gcd} from "../../shared-functions";

const fractionString = (num, den) => [
    ...(Array.from(num.toString(10))).map(digit => UNICODE_SUPERSCRIPT[digit]),
    UNICODE_FRACTIONAL_SLASH,
    ...(Array.from(den.toString(10))).map(digit => UNICODE_SUBSCRIPT[digit])
].join("");

class Fraction extends Component {

    static propTypes = {
        "denominator": PropTypes.number.isRequired,
        "numerator": PropTypes.number.isRequired,
        "vulgar": PropTypes.bool
    }

    render () {

        const {
            denominator,
            numerator,
            vulgar = false
        } = this.props;

        const title = fractionString(numerator, denominator);

        const result = [];

        if (!vulgar && numerator >= denominator) {
            result.push(<span className="integer-part" key="integer">{Math.trunc(numerator / denominator)}</span>);
        }

        const numeratorRest = vulgar ? numerator : numerator % denominator;

        if (numeratorRest !== 0) {
            const {
                [numeratorRest]: {
                    [denominator]: fraction
                } = {}
            } = UNICODE_FRACTION;

            const greatestCommonDivisor = gcd(numeratorRest, denominator);
            result.push(
                <span className="fractional-part" key="fraction">{fraction ? fraction : (
                    [
                        ...(Array.from((numeratorRest / greatestCommonDivisor).toString(10))).map(digit => UNICODE_SUPERSCRIPT[digit]),
                        UNICODE_FRACTIONAL_SLASH,
                        ...(Array.from((denominator / greatestCommonDivisor).toString(10))).map(digit => UNICODE_SUBSCRIPT[digit])
                    ].join(""))}
                </span>
            );

        }

        return <span className="fraction" title={title}>{result}</span>;
    }

}


export default Fraction;
