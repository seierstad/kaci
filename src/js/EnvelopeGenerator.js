class EnvelopeGenerator {
    constructor (context, store, index) {

        this.outputs = {};
        this.triggerTime = null;
        this.releaseTime = null;
        this.index = index;

        this.context = context;
        this.store = store;
        this.state = store.getState().patch.envelopes[index];
        // this.stateChangeHandler = this.stateChangeHandler.bind(this);
        // this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.connections = [];
    }

    setValueAtTime (stepValue, stepTime) {
        this.connections.forEach(connection => connection.setValueAtTime(stepValue, stepTime));
    }

    cancelScheduledValues (time) {
        const cancelTime = time ? time : this.context.currentTime;
        this.connections.forEach(connection => connection.cancelScheduledValues(cancelTime));
    }

    linearRampToValueAtTime (stepValue, stepTime) {
        this.connections.forEach(connection => connection.linearRampToValueAtTime(stepValue, stepTime));
    }

    applyEnvelope (envelope, time) {
        let duration,
            i,
            j,
            step,
            stepTime,
            stepValue;

        this.cancelScheduledValues(time);

        duration = envelope.duration;
        step = envelope.steps[0];
        stepTime = time + (step[0] * duration);
        stepValue = step[1];
        this.linearRampToValueAtTime(stepValue, stepTime);

        for (i = 1, j = envelope.steps.length; i < j; i += 1) {
            step = envelope.steps[i];
            stepTime = time + (step[0] * duration);
            stepValue = step[1];
            this.linearRampToValueAtTime(stepValue, stepTime);
        }
    }

    get releaseDuration () {
        if (this.state && this.state.release && this.state.release.duration) {
            return this.state.release.duration;
        }
        return 0;
    }

    trigger (time) {
        this.triggerTime = time || this.context.currentTime;
        this.applyEnvelope(this.state.attack, this.triggerTime);
    }

    release (time) {
        this.releaseTime = time || this.context.currentTime;
        this.applyEnvelope(this.state.release, this.releaseTime);
    }

    connect (parameter) {
        this.connections.push(parameter);
    }

    disconnect (parameter) {
        if (parameter) {
            const index = this.connections.indexOf(parameter);
            if (index !== -1) {
                this.connections[index].cancelScheduledValues(this.context.currentTime);
                this.connections[index] = null;
            }
        } else {
            this.cancelScheduledValues();
            this.connections = [];
        }
    }

    destroy () {
        // this.unsubscribe();
        this.outputs = null;
        this.triggerTime = null;
        this.releaseTime = null;
        this.index = null;

        this.context = null;
        this.store = null;
        this.state = null;
        this.stateChangeHandler = null;
        this.unsubscribe = null;
        this.connections = null;
        return this;
    }
}


export default EnvelopeGenerator;
