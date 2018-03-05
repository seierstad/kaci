import autobind from "autobind-decorator";
import Periodic from "../decorators/periodic";
import {outputNode} from "../shared-functions";

class StepOscillator {
    constructor (context, dc, patch = {}) {
        const {
            steps = [0, 1, 0.5],
            slew = 0,
            frequency = 1
        } = patch;

        this.state = {};
        this.context = context;
        this.phase = 0;
        this.generator = outputNode(context, dc, 1);
        //this.generator = context.createOscillator();
        //this.generator.frequency.setValueAtTime(2, context.currentTime);
        this.steps = steps;
        this.slew = slew;
        this.frequency = frequency;
        this.interval = null;
        this.stepFunction = () => null;
    }

    set steps (steps) {
        this.state.steps = steps;
    }

    get steps () {
        return this.state.steps;
    }

    set slew (slew) {
        this.state.slew = slew;
    }

    get slew () {
        return this.state.slew;
    }

    set frequency (f) {
        this.state.frequency = f;
        //this.generator.frequency.setValueAtTime(f, this.context.currentTime);
    }

    get frequency () {
        return this.state.frequency;
    }

    getStepFunction (steps, frequency, offset) {
        return () => {
            const now = this.context.currentTime;
            const stepDuration = 1.0 / (frequency * steps.length);

            steps.forEach((step, index) => {
                const time = now + (stepDuration * index);
                console.log(stepDuration, index, now, step, time);
                this.generator.gain.setValueAtTime(step, time);
            }, this);
        };
    }

    start () {
        //this.generator.start();
        this.stepFunction = this.getStepFunction(this.steps, this.frequency);
        this.stepFunction();
        this.interval = setInterval(this.stepFunction, (1000.0 / this.frequency));
    }

    stop () {
        //this.generator.stop();
        clearInterval(this.interval);
        this.generator.gain.cancelScheduledValues(this.context.currentTime);
    }

    connect (...args) {
        this.generator.connect(...args);
    }

    disconnect (...args) {
        this.generator.disconnect(...args);
    }
}


class StepSequencer extends Periodic {


    constructor (context, store, dc, index, patch, isSyncMaster) {
        super(context, store, patch, dc, index, isSyncMaster);

        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);
        this.storedState = patch;

        this.oscillator = new StepOscillator(context, dc, patch);

        this.oscillator.connect(this.postGain);

        for (let name in this.outputs) {
            this.oscillator.connect(this.outputs[name]);
        }

        if (!this.state.sync || !this.state.sync.enabled) {
            this.frequency = this.state.frequency;
        }

        this.parameters = {...this.oscillator.targets};

        this.waveform = this.state.waveform;
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

        if (newStepsState && (newStepsState !== this.storedState)) {
            super.updateState(newStepsState);

            if (this.storedState.steps !== newStepsState.steps) {
                this.steps = newStepsState.steps;
            }

            this.storedState = newStepsState;
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
