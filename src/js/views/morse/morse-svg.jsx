import React, {Component, PropTypes} from "react";


class MorseSvg extends Component {

    static propTypes = {
        "data": PropTypes.arrayOf(PropTypes.bool).isRequired,
        "guides": PropTypes.arrayOf(PropTypes.number),
        "wrap": PropTypes.number
    }

    constructor (props) {
        super(props);
        this.setPhaseAnimation = this.setPhaseAnimation.bind(this);
        this.width = 0;
        this.height = 0;
        this.phaseIndicator = null;
        this.animation = null;
        this.row = null;
        this.duration = 1000;
    }

    componentDidMount() {
        /*
        this.phaseIndicator.style.offsetPath = this.pathData;
        this.phaseIndicator.style.offsetDistance = 4;
        */
        this.setPhaseAnimation();

    }

    componentDidUpdate () {
        this.setPhaseAnimation();
    }

    setPhaseAnimation () {
        this.row.animate([
            {transform: "translateY(0)" },
            {transform: "translateY(" + this.height + "px)" }
        ], {
            fill: "forwards",
            easing: "steps(" + this.height + ", start)",
            iterations: 1,
            duration: this.duration
        });

        this.phaseIndicator.animate([
            {transform: "translateX(0)"},
            {transform: "translateX(" + this.width + "px)"}
        ], {
            fill: "forwards",
            easing: "steps(" + this.width + ", start)",
            iterations: this.height,
            duration: this.duration / this.height
        });
    }

    render () {
        const {data, wrap, strokeWidth = 1, guides = [3, 4]} = this.props;
        const {length} = data;
        const width = wrap ? wrap : length;
        const height = wrap ? Math.ceil(length / wrap) : 1;
        this.width = width;
        this.height = height;

        const pattern = data.reduce((acc, curr, index, arr) => {
            if (index === 0) {
                return [1];
            }

            if (curr !== arr[index - 1]) {
                return [...acc, 1];
            }

            acc[acc.length - 1] += 1;

            return acc;
        }, []);

        const [startHigh] = data;
        let row = 0.5; // adjust for stroke width
        let col = 0;

        const paths = pattern.reduce((acc, curr, index) => {
            const nextCol = col + curr;

            if (startHigh === ((index % 2) === 1)) {
                // silence, set start position for next dit/dah
                if (wrap && nextCol >= wrap) {
                    row += 1;
                }
                col = nextCol % wrap;

                return acc;
            }

            if (wrap && (nextCol > wrap)) {
                // split a dah
                const overflow = nextCol - wrap;
                const path = <path className="dah split" d={["M", col * strokeWidth, row * strokeWidth, "h", (curr - overflow) * strokeWidth, "M", 0, (row + 1) * strokeWidth, "h", overflow * strokeWidth].join(" ")} key={index + "-start"} markerMid="url(#wrapped-dah)"/>;

                col = overflow;
                row += 1;

                return [...acc, path];
            }

            const path = <path className={curr === 1 ? "dit" : "dah"} d={["M", col * strokeWidth, row * strokeWidth, "h", curr * strokeWidth].join(" ")} key={index} />;

            if (wrap) {
                if (nextCol === wrap) {
                    row += 1;
                }

                col = nextCol % wrap;
            }

            return [...acc, path];
        }, []);

        const wrapRest = length % wrap;
        const backgroundBottom = (!wrap || wrapRest === 0) ? ["h", width * strokeWidth] : ["h", wrapRest * strokeWidth, "v", -strokeWidth, "h", (width - wrapRest) * strokeWidth];

        const guideHeight = strokeWidth * (height + 2);
        const guidePaths = guides.map(guide => {
            const d = [];
            for (let i = 1; i < guide; i += 1) {
                d.push(...["M", (i * width / guide) * strokeWidth, -strokeWidth, "v", guideHeight]);
            }

            return <path className="guide" d={d.join(" ")} key={guide} />;
        });

        let motionPathDataPoints = [];
        for (let r = 0, l = length; r < height; r += 1, l -= width) {
            motionPathDataPoints.push("M0", ((r + 0.5) * strokeWidth), "h", Math.min(l, width) * strokeWidth);
        }

        const motionPathData = motionPathDataPoints.join(" ");
        this.pathData = motionPathData;
        return (
            <svg
                className="morse-svg"
                viewBox={[0, 0, width * strokeWidth, height * strokeWidth].join(" ")}
            >
                <defs>
                    <marker id="wrapped-dah"
                        markerHeight="1"
                        markerUnits="strokeWidth"
                        markerWidth="1"
                        orient="auto"
                        refX="5"
                        refY="5"
                        viewBox="0 0 10 10"
                    >
                        <path d="M 5 0 L 0 5 5 10 10 5 z" fill="currentColor" />
                    </marker>
                    <path d={motionPathData} id="motion-path" pathLength={length} />
                </defs>
                <path className="morse-background" d={["M", width * strokeWidth, 0, "h", -width * strokeWidth, "v", height * strokeWidth, ...backgroundBottom, "z"].join(" ")} />
                {paths}
                {guidePaths}
                <g className="row" ref={row => this.row = row}>
                    <rect
                        fill="blue"
                        height={strokeWidth}
                        opacity="0.5"
                        width="100%"
                        y="-1"
                    />
                    <circle
                        cx={strokeWidth / -2}
                        cy={strokeWidth / -2}
                        fill="pink"
                        r={strokeWidth / 2}
                        ref={c => this.phaseIndicator = c}
                    />
                </g>
            </svg>
        );
    }
}


export default MorseSvg;
