import autobind from "autobind-decorator";
import Periodic from "../decorators/periodic";
import {outputNode} from "../shared-functions";
import LoggerNode from "../logger";

class StepOscillator {
    constructor (context, dc, patch = {}) {
        const {
            steps = [],
            levels,
            glide = 0,
            frequency = 1
        } = patch;

        this.state = {};
        this.context = context;
        this.phase = 0;
        this.generator = outputNode(context, dc, 1);
        this.waveShaperNode = context.createWaveShaper();
        this.waveShaperNode.curve = Float32Array.of(-1, -1, 1);
        this.generator.connect(this.waveShaperNode);

        this.steps = steps;
        this.levels = levels;
        this.glide = 0.5;
        this.frequency = frequency;
        this.interval = null;
        this.stepFunction = () => null;
        this.previousScheduledValue = 0;
    }

    set steps (steps) {
        this.state.steps = steps;
    }

    get steps () {
        return this.state.steps;
    }

    set levels (levels) {
        this.state.levels = levels;
    }

    get levels () {
        return this.state.levels;
    }

    set glide (glide) {
        this.state.glide = glide;
    }

    get glide () {
        return this.state.glide;
    }

    set frequency (f) {
        this.state.frequency = f;
    }

    get frequency () {
        return this.state.frequency;
    }

    getStepFunction (steps, frequency, glide, offset) {
        return () => {
            const now = this.context.currentTime;
            const stepDuration = 1.0 / (frequency * steps.length);

            steps.forEach((step, index) => {
                const time = now + (stepDuration * index);
                const scaledValue = step / (this.levels - 1);
                if (this.glide === 0) {
                    this.generator.gain.setValueAtTime(scaledValue, time);
                    this.previousScheduledValue = scaledValue;
                } else {
                    this.generator.gain.setValueAtTime(this.previousScheduledValue, time);
                    this.generator.gain.linearRampToValueAtTime(scaledValue, time + (stepDuration * this.glide));
                    this.previousScheduledValue = scaledValue;
                }
            }, this);
        };
    }

    start () {
        this.generator.gain.setValueAtTime(this.steps[0], this.context.currentTime);
        this.previousScheduledValue = this.steps[0];

        this.stepFunction = this.getStepFunction(this.steps, this.frequency, this.glide);
        this.stepFunction();
        this.interval = setInterval(this.stepFunction, (1000.0 / this.frequency));
    }

    stop () {
        clearInterval(this.interval);
        this.generator.gain.cancelScheduledValues(this.context.currentTime);
    }

    connect (...args) {
        this.waveShaperNode.connect(...args);
    }

    disconnect (...args) {
        this.waveShaperNode.disconnect(...args);
    }
}


class StepSequencer extends Periodic {


    constructor (context, store, dc, index, patch, isSyncMaster) {
        super(context, store, patch, dc, index, isSyncMaster);

        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.oscillator = new StepOscillator(context, dc, patch);
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
