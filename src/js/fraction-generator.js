
// return all fractions between 1 and maxValue
// with total number of factors equal to or less than maxNumberOfFactors
// using only factors listed in primeFactors

const smallerThanOrEqualTo = (limit) => (number) => number <= limit;
const byValue = (a, b) => a < b ? -1 : 1;
const byProp = (prop) => ({[prop]: a}, {[prop]: b}) => a < b ? -1 : 1;
const getApplyItemsReducer = (items = []) => (arr) => items.map(item => [...arr, item].sort(byValue));

const arraySort = (a, b) => {
    if (a.length !== b.length) {
        return a.length < b.length ? -1 : 1;
    }
    return a.some((value, index) => value < b[index]) ? -1 : 1;
};

const arraysDiffer = (a, b) => {
    return (a.length !== b.length) || a.some((value, index) => value !== b[index]);

};

const uniqueArrayReducer = (acc, curr) => {
    const previous = acc[acc.length - 1];
    if (!previous || arraysDiffer(curr, previous)) {
        return [...acc, curr];
    }
    return acc;
};

function getTemperedScales (base, maxSteps) {
    const result = [];
    for (let stepCount = 2; stepCount <= maxSteps; stepCount += 1) {
        const scale = [];

        for (let step = 0; step <= stepCount; step += 1) {
            scale[step] = Math.pow(base, (step / (stepCount)));
        }
        result.push(scale);
    }
    return result;
}

function logBase (base, value) {
    return Math.log2(value) / Math.log2(base);
}

const noteInLogCents = (note, base, steps) => logBase(base, note) * steps * 100;


// generate alle possible sets with given size from items
function getCombinations (setSize, items = []) {
    const result = [[[]]];

    for (let i = 1; i <= setSize; i += 1) {
        const row = [];
        for (let combination of result[i - 1]) {
            for (let item of items) {
                row.push([...combination, item].sort(byValue));
            }
        }
        result[i] = row.sort(arraySort).reduce(uniqueArrayReducer, []);
    }
    return result;
}

const noCommonElements = arr1 => (obj) => !arr1.some(element => obj.factors.includes(element));
const withinRange = (min, max) => ({product}) => (product >= min) && (product <= max);

const multiplyReducer = (acc, curr) => acc * curr;

const rationalScaleGenerator = (maxValue, maxNumberOfFactors = 2, factors = [], compareToTemperedMax = null) => {

	const result = [];

	if (factors.some(smallerThanOrEqualTo(maxValue))) {

        const allCombinations = getCombinations(maxNumberOfFactors, factors.sort(byValue));
        allCombinations[0] = [[1]];

        const combinations = allCombinations.map(countCombinations => {
            const products = new Set();

            return countCombinations.map(combination => ({
                factors: combination,
                product: combination.reduce(multiplyReducer, 1)
            })).filter(obj => {
                if (!products.has(obj.product)) {
                    products.add(obj.product);
                    return true;
                }
                return false;
            }).sort((a, b) => a.product < b.product ? -1 : 1);
        });

        for (let factorCount = 0; factorCount <= maxNumberOfFactors; factorCount += 1) {
            for (let numeratorCount = 0; numeratorCount <= factorCount; numeratorCount += 1) {
                const denominatorCount = factorCount - numeratorCount;

                const numerators = combinations[numeratorCount];
                const denominators = combinations[denominatorCount];

                // for all numerators:
                // combine with all denominators with no common factors
                // add to result if the fraction is between 1 and maxValue

                numerators.forEach(({product: numerator, factors: numeratorFactors}) => {
                    const minDominator = numerator / maxValue;

                    const withinRangeFilter = withinRange(maxValue / numerator, numerator);
                    const commonElementsFilter = noCommonElements(numeratorFactors);

                    denominators
                        .filter(withinRangeFilter)
                        .filter(commonElementsFilter)
                        .forEach(({product: denominator}) => {

                            const value = numerator / denominator;

                            if (value >= 1 && value <= maxValue) {
                                result.push({
                                    value: numerator / denominator,
                                    numerator,
                                    denominator,
                                    factorCount
                                });
                            }
                        });
                });
            }
        }
	}

    if (compareToTemperedMax) {
        const scales = getTemperedScales(maxValue, compareToTemperedMax);

        return result.sort(byProp("value")).map(step => {
            const logStep = logBase(maxValue, step.value);
            const matchTemperedScales = scales.map(scale => {
                const scaleLength = scale.length - 1;
                const index = Math.round(logStep * scaleLength);
                const offsetCents = (logStep * scaleLength - index) * 100;
                return {index, offsetCents, scaleLength};
            });
            return {
                ...step,
                ...matchTemperedScales
            };
        });
    }

	return result.sort(byProp("value"));
};


console.log(rationalScaleGenerator(2, 20, [2, 3], 12));
