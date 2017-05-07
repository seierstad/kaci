import React, {Component, PropTypes} from "react";


class MorseSvg extends Component {

    static propTypes = {
        "data": PropTypes.arrayOf(PropTypes.bool).isRequired,
        "guides": PropTypes.arrayOf(PropTypes.number),
        "wrap": PropTypes.number
    }

    render () {
        const {data, wrap, strokeWidth = 6, guides = [3, 4]} = this.props;
        const {length} = data;
        const width = wrap ? wrap : length;
        const height = wrap ? Math.ceil(length / wrap) : 1;

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

        return (
            <svg
                className="morse-svg"
                height={height * strokeWidth}
                viewBox={[0, 0, width * strokeWidth, height * strokeWidth].join(" ")}
                width={width * strokeWidth}
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
                </defs>
                <path className="morse-background" d={["M", width * strokeWidth, 0, "h", -width * strokeWidth, "v", height * strokeWidth, ...backgroundBottom, "z"].join(" ")} />
                {paths}
                {guidePaths}
            </svg>
        );
    }
}


export default MorseSvg;
