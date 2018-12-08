import autobind from "autobind-decorator";
import Modulator from "../modulator/modulator";
import {outputNode} from "../shared-functions";
//import LoggerNode from "../logger";
import KaciNode from "../kaci-node";

class StepOscillator extends KaciNode {
    constructor (...args) {
        super(...args);

        const [context, store, patch = {}] = args;
        const {
            steps = [0],
            levels = 1,
            glide = 0,
            frequency = 1,
            speedUnit = steps.length || 1
        } = patch;

        this.state = {};
        this.phase = 0;
        this.generator = outputNode(this.context, 1);
        this.waveShaperNode = context.createWaveShaper();
        this.waveShaperNode.curve = Float32Array.of(-1, -1, 1);
        this.generator.connect(this.waveShaperNode);

        this.steps = steps;

        this.frequency = frequency;
        this.speedUnit = speedUnit;

        this.levels = levels;
        this.glide = glide;

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

    set steps (steps) {
        this.updateState("steps", steps);
    }

    get steps () {
        return this.state.steps;
    }

    set levels (levels) {
        this.updateState("levels", levels);
    }

    get levels () {
        return this.state.levels;
    }

    set glide (glide) {
        this.updateState("glide", glide);
    }

    get glide () {
        return this.state.glide;
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
        return this.steps.length * this.stepDuration;
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

            this.steps.forEach((step, index) => {
                const {
                    value,
                    glide = false
                } = step;

                const time = now + (this.stepDuration * index);
                const scaledValue = value / (this.levels - 1);

                if (!glide || this.glide === 0) {
                    this.generator.gain.setValueAtTime(scaledValue, time);
                } else {
                    this.generator.gain.setValueAtTime(this.previousScheduledValue, time);
                    this.generator.gain.linearRampToValueAtTime(scaledValue, time + (this.stepDuration * this.glide));
                }
                this.previousScheduledValue = scaledValue;

            }, this);
            this.startTime = now;
        };
    }

    start () {
        // this.generator.gain.setValueAtTime(this.steps[0], this.context.currentTime);
        this.previousScheduledValue = this.steps[0].value;

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


class StepSequencer extends Modulator {


    constructor (...args) {
        super(...args);
        const [context, store, patch, index] = args;

        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.oscillator = new StepOscillator(...args);
        this.oscillator.connect(this.postGain);

        for (let name in this.outputs) {
            this.oscillator.connect(this.outputs[name]);
        }

        if (!this.state.sync || !this.state.sync.enabled) {
            this.frequency = this.state.frequency;
        }

        this.parameters = {...this.oscillator.targets};

        this.steps = this.state.steps;
        this.levels = this.state.levels;
        this.glide = this.state.glide;
    }

    set steps (steps) {
        this.oscillator.steps = steps;
    }

    set levels (levels) {
        this.oscillator.levels = levels;
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

            if (this.state.steps !== newStepsState.steps) {
                this.oscillator.steps = newStepsState.steps;
            }

            if (this.state.levels !== newStepsState.levels) {
                this.oscillator.levels = newStepsState.levels;
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
