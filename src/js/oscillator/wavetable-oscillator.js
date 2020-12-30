// wavetable-oscillator

/*
samplerate (sr) = 44100
interpolation (ip) = true/false
resample (rs) = true/false
freq = 440
wavetable (wt) = [[...s_count - 1], [], [], ...w_count - 1]
wave = 0...1
phase (ph) = 0...1

*/

const wtFunction = (waveTable, interpolation = false, resample = false) => (waveParam) => {
    const floor = Math.floor(waveParam * waveTable.length);
    const waveLength = waveTable[0].length;

    const waveData = !interpolation ? (
        waveTable[floor]
    ) : (
        [
            {
                factor: waveParam - floor,
                wave: waveTable[floor]
            }, {
                factor: 1 - waveParam - floor,
                wave: (floor === waveTable.length - 1) ? waveTable[0] : waveTable[floor + 1]
            }
        ]
    );

    return (phase, endPhase = phase) => {
        const indexStartFloat = phase * waveLength;
        const indexStart = Math.floor(indexStartFloat);
        const indexEndFloat = endPhase * waveLength;
        const indexEnd = Math.floor(indexEndFloat);
        const indexDiff = indexEnd - indexStart;

        if (!interpolation) {
            if (!resample || indexDiff === 0) {
                return waveData[indexStart];
            }

            const result = 0;
            result += waveData[indexStart] * (indexStart + 1 - indexStartFloat);
            result += waveData[indexEnd] * (indexEndFloat - indexEnd);

            if (indexDiff > 1) {
                for (let i = 1; i < indexDiff; i += 1) {
                    result += waveData[indexStart + i];
                }
            }
            return result;
        }

        if (!resample || indexDiff === 0) {
            return waveData[0].wave[indexStart] * waveData[0].factor + waveData[1].wave[indexStart] * waveData[1].factor;
        }

        const result = 0;
        result += (
            waveData[0].wave[indexStart] * (indexStart + 1 - indexStartFloat)
            + waveData[0].wave[indexEnd] * (indexEndFloat - indexEnd)
        ) * waveData[0].factor;
        result += (
            waveData[1].wave[indexStart] * (indexStart + 1 - indexStartFloat)
            + waveData[1].wave[indexEnd] * (indexEndFloat - indexEnd)
        ) * waveData[1].factor;

        if (indexDiff > 1) {
            for (let i = 1; i < indexDiff; i += 1) {
                result += waveData[0].wave[indexStart + i] * waveData[0].factor;
                result += waveData[1].wave[indexStart + i] * waveData[1].factor;
            }
        }
        return result;

    };
};
