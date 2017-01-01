import React, {Component, PropTypes} from "react";


class Circle extends Component {
    constructor () {
        super();
        this.handleClick = this.handleClick.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleMouseDrag = this.handleMouseDrag.bind(this);
    }
    handleBlur (event) {
        const {module, envelopeIndex, part, index, handlers, first, last} = this.props;
        handlers.circleBlur(event, module, envelopeIndex, part, index, first, last);
    }
    handleMouseDrag (event) {
        const {module, envelopeIndex, part, background, index, first, last, handlers} = this.props;
        handlers.circleMouseDrag(event, module, envelopeIndex, part, background, index, first, last);
    }
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

Circle.propTypes = {
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
};


export default Circle;
