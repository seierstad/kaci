import React, {Component, PropTypes} from "react";


class Circle extends Component {
    constructor () {
        super();
        this.click = this.click.bind(this);
        this.blur = this.blur.bind(this);
        this.mouseDrag = this.mouseDrag.bind(this);
    }
    blur (event) {
        const {module, envelopeIndex, part, index, handlers, first, last} = this.props;
        handlers.circleBlur(event, module, envelopeIndex, part, index, first, last);
    }
    mouseDrag (event) {
        const {module, envelopeIndex, part, background, index, first, last, handlers} = this.props;
        handlers.circleMouseDrag(event, module, envelopeIndex, part, background, index, first, last);
    }
    click (event) {
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
                onMouseDown={this.click}
                onMouseMove={active ? this.mouseDrag : null}
                onMouseOut={active ? this.blur : null}
                onMouseUp={active ? this.blur : null}
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

