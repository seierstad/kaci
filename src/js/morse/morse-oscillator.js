import Oscillator from "../oscillator/oscillator";

export class MorseOscillator extends Oscillator {

    generatorFunction (frequency, detune) {
        let calculatedFrequency;

        if (frequency === this.previous.frequency && detune === this.previous.detune) {
            calculatedFrequency = this.previous.calculatedFrequency;
        } else {
            calculatedFrequency = this.getComputedFrequency(frequency, detune);
            this.previous = {
                frequency,
                detune,
                calculatedFrequency
            };
        }
        this.incrementPhase(calculatedFrequency);

        const index = Math.floor(this.phase * this.sequence.length);

        return this.sequence[index] ? 1 : -1;
    }

    set sequence (sequence) {
        this.morsePattern = sequence;
    }

    get sequence () {
        return this.morsePattern;
    }
}
