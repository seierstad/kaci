import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";


class Circle extends Component {

    static propTypes = {
        "active": PropTypes.bool,
        "background": PropTypes.element,
        "cx": PropTypes.string.isRequired,
        "cy": PropTypes.string.isRequired,
        "envelopeIndex": PropTypes.number,
        "first": PropTypes.bool,
        "handlers": PropTypes.shape({
            "circleBlur": PropTypes.func.isRequired,
            "circleClick": PropTypes.func.isRequired,
            "circleMouseDrag": PropTypes.func.isRequired
        }),
        "index": PropTypes.number.isRequired,
        "last": PropTypes.bool,
        "module": PropTypes.string.isRequired,
        "part": PropTypes.string,
        "r": PropTypes.number.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.cx !== nextProps.cx) || (this.props.cy !== nextProps.cy) || (this.props.active !== nextProps.active);
    }

    @autobind
    handleBlur (event) {
        const {module, envelopeIndex, part, index, handlers, first, last} = this.props;
        handlers.circleBlur(event, module, envelopeIndex, part, index, first, last);
    }

    @autobind
    handleMouseDrag (event) {
        const {module, envelopeIndex, part, background, index, first, last, handlers} = this.props;
        handlers.circleMouseDrag(event, module, envelopeIndex, part, background, index, first, last);
    }

    @autobind
    handleClick (event) {
        const {module, envelopeIndex, part, index, handlers, first, last} = this.props;
        handlers.circleClick(event, module, envelopeIndex, part, index, first, last);
    }

    render () {
        const {cx, cy, r, active, first, last} = this.props;
        return (
            <circle
                className={(active ? "active" : "") + (first ? " first" : "") + (last ? " last" : "")}
                cx={cx}
                cy={cy}
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

