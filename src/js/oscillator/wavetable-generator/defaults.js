const wave_length = 128;
const wave_count = 64;

const saw = Array(wave_length).fill().map((curr, i) => i / wave_length);
const result = Array(wave_count).fill(saw);

const defaults = {
    result,
    wave_count,
    wave_length
};


export default defaults;
