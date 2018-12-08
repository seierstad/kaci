const trailingZeros = (size) => {

    const MASK = (1 << size + 1) - 1;

    return (number) => {
        if ((number & MASK) === 0) {
            return size;
        }

        let zeros = 1;

        while ((MASK & number) === ((MASK << zeros) & number)) {
            zeros += 1;
        }

        return zeros - 1;
    };
};

const noise = {

    "white": () => (buffer) => {
        buffer.forEach((val, index, arr) => arr[index] = Math.random() * 2 - 1);
    },

    "pink": (resolution = 8) => {
        const values = new Float32Array(Math.floor(resolution));
        values.forEach((v, index, arr) => arr[index] = Math.random() * 2);

        const getIndex = trailingZeros(resolution);

        let sum = values.reduce((acc, current) => acc + current);
        let maxPosition = (1 << resolution) - 1;
        let position = 1;

        const pinkSum = (v, i, output) => {
            const index = getIndex(position);
            const prev = values[index];
            const curr = Math.random() * 2;
            values[index] = curr;
            sum += (curr - prev);

            position = (position % maxPosition) + 1;

            output[i] = (sum / resolution) - 1;
        };

        return (buffer) => {
            buffer.forEach(pinkSum);
        };
    },

    /*
    "blue": (resolution = 8) => {
        const values = new Float32Array(resolution);
        values.forEach((v, index, arr) => arr[index] = (Math.random() * 2));

        const getIndex = trailingZeros(resolution);

        const blueSum = (acc, current) => acc + (acc - current);

        let maxPosition = (1 << resolution) - 1;
        let position = 1;

        const blue = (v, i, output) => {
            const index = getIndex(position);
            values[index] = Math.random() * 2;

            position = (position % maxPosition) + 1;

            output[i] = values.reduce(blueSum) - 1;
        };

        return (buffer) => {
            buffer.forEach(blue);
        };
    },
    */

    "geometric": (decayFactor = 0.1) => {
        let previous = Math.random() * 2 - 1;
        const previousFactor = 1 - decayFactor;

        return (buffer) => {
            buffer.forEach((v, i, arr) => {
                arr[i] = previous * previousFactor + (Math.random() * 2 - 1) * decayFactor;
                previous = arr[i];
            });
        };
    }
};

export default noise;
