import autobind from "autobind-decorator";
import Periodic from "../periodic/periodic-modulator";
import {outputNode} from "../shared-functions";
//import LoggerNode from "../logger";
import KaciNode from "../kaci-node";

class StepOscillator extends KaciNode {
    constructor (...args) {
        super(...args);

        const [context, , patch = {}] = args;
        const {
            sequence = [{value: 0, glide: false}],
            maxValue = 1,
            glide: {
                mode = "symmetric",
                time = 0,
                slope = "linear",
                falling: {
                    time: fallingTime = 0,
                    slope: fallingSlope = "linear"
                } = {}
            } = 0,
            speed: {
                frequency = 1,
                speedUnit = sequence.length || 1,
                sync: {
                    enabled: syncEnabled = false,
                    nominator: syncNominator = 1,
                    denominator: syncDenominator = 1
                } = {}
            } = {}
        } = patch;

        this.state = {};
        this.phase = 0;
        this.generator = outputNode(this.context, 1);
        this.waveShaperNode = context.createWaveShaper();
        this.waveShaperNode.curve = Float32Array.of(-1, -1, 1);
        this.generator.connect(this.waveShaperNode);

        this.sequence = sequence;

        this.frequency = frequency;
        this.speedUnit = speedUnit;
        this.syncEnabled = syncEnabled;
        this.syncNominator = syncNominator;
        this.syncDenominator = syncDenominator;

        this.maxValue = maxValue;

        this.glideSymmetric = (mode === "symmetric");
        this.glideTime = time;
        this.glideSlope = slope;
        this.fallingTime = fallingTime;
        this.fallingSlope = fallingSlope;

        this.interval = null;
        this.stepFunction = () => null;
        this.previousScheduledValue = 0;
        this.startTime = null;
        this.running = false;

    }

    updateState (property, value) {
        const offset = this.offset;

        this.state[property] = value;

        if (offset !== 0) {
            this.updateSequence(offset);
        }
    }

    set sequence (sequence) {
        this.updateState("sequence", sequence);
    }

    get sequence () {
        return this.state.sequence;
    }

    set maxValue (maxValue) {
        this.updateState("maxValue", maxValue);
    }

    get maxValue () {
        return this.state.maxValue;
    }

    set glideTime (glideTime) {
        this.updateState("glideTime", glideTime);
    }

    get glideTime () {
        return this.state.glideTime;
    }

    set glide (glide) {
        const {
            mode,
            time,
            slope,
            falling: {
                time: fallingTime,
                slope: fallingSlope
            } = {}
        } = glide;

        this.glideSymmetric = (mode === "symmetric");
        this.glideTime = time;
        this.glideSlope = slope;
        this.fallingTime = fallingTime;
        this.fallingSlope = fallingSlope;
    }

    set frequency (frequency) {
        this.updateState("frequency", frequency);
    }

    get frequency () {
        return this.state.frequency;
    }

    set speedUnit (speedUnit) {
        this.updateState("speedUnit", speedUnit);
    }

    get speedUnit () {
        return this.state.speedUnit;
    }

    get speedUnitDuration () {
        return 1.0 / this.frequency;
    }

    get stepDuration () {
        return this.speedUnitDuration / this.speedUnit;
    }

    get sequenceDuration () {
        return this.sequence.length * this.stepDuration;
    }

    get offset () {
        if (!this.running) {
            return 0;
        }
        const timeOffset = this.context.currentTime - this.startTime;
        return this.sequenceDuration / timeOffset;
    }

    getStepFunction () {
        return () => {
            const now = this.context.currentTime;

            this.sequence.forEach((step, index) => {
                const {
                    value,
                    glide = false
                } = step;

                const time = now + (this.stepDuration * index);
                const scaledValue = value / (this.maxValue);

                if (!glide || (this.glideTime === 0 && this.fallingTime === 0)) {
                    this.generator.gain.setValueAtTime(scaledValue, time);
                } else {
                    this.generator.gain.setValueAtTime(this.previousScheduledValue, time);
                    if (this.glideSymmetric || (scaledValue >= this.previousScheduledValue)) {
                        if (this.glideSlope === "linear" || scaledValue === 0) {
                            this.generator.gain.linearRampToValueAtTime(scaledValue, time + (this.stepDuration * this.glideTime));
                        } else {
                            this.generator.gain.exponentialRampToValueAtTime(scaledValue, time + (this.stepDuration * this.glideTime));
                        }
                    } else {
                        if (this.fallingSlope === "linear" || scaledValue === 0) {
                            this.generator.gain.linearRampToValueAtTime(scaledValue, time + (this.stepDuration * this.fallingTime));
                        } else {
                            this.generator.gain.exponentialRampToValueAtTime(scaledValue, time + (this.stepDuration * this.fallingTime));
                        }

                    }
                }
                this.previousScheduledValue = scaledValue;

            }, this);
            this.startTime = now;
        };
    }

    start () {
        // this.generator.gain.setValueAtTime(this.sequence[0], this.context.currentTime);
        this.previousScheduledValue = this.sequence[0].value;

        this.stepFunction = this.getStepFunction();
        this.stepFunction();
        this.running = true;
        this.interval = setInterval(this.stepFunction, 1000.0 * this.sequenceDuration);
    }

    stop () {
        clearInterval(this.interval);
        this.interval = null;
        this.generator.gain.cancelScheduledValues(this.context.currentTime);
        this.running = false;
    }

    updateSequence (offset) {
        clearInterval(this.interval);
        setTimeout(() => {
            this.stepFunction();
            this.interval = setInterval(this.stepFunction, 1000.0 * this.sequenceDuration);
        }, this.sequenceDuration * (1 - offset));
    }

    connect (node) {
        this.waveShaperNode.connect(node);
    }

    disconnect (node) {
        this.waveShaperNode.disconnect(node);
    }
}


class StepSequencer extends Periodic {


    constructor (...args) {
        super(...args);

        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.oscillator = new StepOscillator(...args);
        this.oscillator.connect(this.postGain);

        for (let name in this.outputs) {
            this.oscillator.connect(this.outputs[name]);
        }

        if (!this.state.speed.sync || !this.state.speed.sync.enabled) {
            this.frequency = this.state.speed.frequency;
        }

        this.parameters = {...this.oscillator.targets};

        this.sequence = this.state.sequence;
        this.levels = this.state.levels;
        this.glide = this.state.glide;
    }

    set sequence (sequence) {
        this.oscillator.sequence = sequence;
    }

    set maxValue (maxValue) {
        this.oscillator.maxValue = maxValue;
    }

    set glide (glide) {
        this.oscillator.glide = glide;
    }

    @autobind
    stateChangeHandler () {
        const newState = this.store.getState() || {};
        const {
            patch: {
                steps: {
                    [this.index]: newStepsState
                } = {}
            } = {}
        } = newState;

        if (newStepsState && (newStepsState !== this.state)) {
            super.updateState(newStepsState);

            if (this.state.sequence !== newStepsState.sequence) {
                this.oscillator.sequence = newStepsState.sequence;
            }

            if (this.state.maxValue !== newStepsState.maxValue) {
                this.oscillator.maxValue = newStepsState.maxValue;
            }

            if (this.state.glide !== newStepsState.glide) {
                this.oscillator.glide = newStepsState.glide;
            }

            this.state = newStepsState;
        }
    }

    destroy () {
        super.destroy();

        this.unsubscribe();

        this.stateChangeHandler = null;
        this.unsubscribe = null;
    }
}


export {
    StepOscillator
};


export default StepSequencer;
