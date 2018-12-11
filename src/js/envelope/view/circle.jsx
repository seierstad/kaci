import React, {Component} from "react";
import PropTypes from "prop-types";
import {boundMethod} from "autobind-decorator";

import {toPercent} from "./shared-functions";


class Circle extends Component {

    static propTypes = {
        "circleMouseDragHandler": PropTypes.func.isRequired,
        "handlers": PropTypes.shape({
            "circleBlur": PropTypes.func.isRequired,
            "circleClick": PropTypes.func.isRequired
        }),
        "point": PropTypes.object.isRequired,
        "r": PropTypes.number.isRequired
    }

    @boundMethod
    handleBlur () {
        const {point: {index}, handlers} = this.props;
        handlers.circleBlur(index);
    }

    @boundMethod
    handleMouseDrag () {
        const {point: {index}, circleMouseDragHandler} = this.props;
        circleMouseDragHandler(index, event);
    }

    @boundMethod
    handleClick () {
        const {point: {index}, handlers} = this.props;
        handlers.circleClick(index);
    }

    render () {
        const {
            point: {
                x,
                y,
                active,
                first,
                last
            },
            r
        } = this.props;

        const classNames = [];
        if (active) {classNames.push("active");}
        if (first) {classNames.push("first");}
        if (last) {classNames.push("last");}

        return (
            <circle
                className={classNames.length > 0 ? classNames.join(" ") : null}
                cx={toPercent(x)}
                cy={toPercent(1 - y)}
                onMouseDown={this.handleClick}
                onMouseMove={active ? this.handleMouseDrag : null}
                onMouseOut={active ? this.handleBlur : null}
                onMouseUp={active ? this.handleBlur : null}
                r={r}
            />
        );
    }
}


export default Circle;

