const EnvelopeGenerator = function (context, envelopeData, id) {
    this.context = context;
    this.outputs = {};
    this.triggerTime = null;
    this.releaseTime = null;
    this.id = id;

    this.envelope = envelopeData;
    this.connections = [];
    this.connections.setValueAtTime = function (stepValue, stepTime) {
        for (let i = 0, j = this.length; i < j; i += 1) {
            this[i].setValueAtTime(stepValue, stepTime);
        }
    };
    this.connections.cancelScheduledValues = function (time) {
        const cancelTime = time ? time : context.currentTime;

        for (let i = 0, j = this.length; i < j; i += 1) {
            this[i].cancelScheduledValues(cancelTime);
        }
    };
    this.connections.linearRampToValueAtTime = function (stepValue, stepTime) {
        for (let i = 0, j = this.length; i < j; i += 1) {
            this[i].linearRampToValueAtTime(stepValue, stepTime);
        }
    };
    this.connections.disconnect = function () {
        for (let i = 0, j = this.length; i < j; i += 1) {
            this[i] = null;
        }
    };

};

EnvelopeGenerator.prototype.applyEnvelope = function (envelope, time) {

    this.connections.cancelScheduledValues(time);

    let duration = envelope.duration;
    let step = envelope.steps[0];
    let stepTime = time + (step[0] * duration);
    let stepValue = step[1];
    this.connections.linearRampToValueAtTime(stepValue, stepTime);

    for (let i = 1, j = envelope.steps.length; i < j; i += 1) {
        step = envelope.steps[i];
        stepTime = time + (step[0] * duration);
        stepValue = step[1];
        this.connections.linearRampToValueAtTime(stepValue, stepTime);
    }
};

EnvelopeGenerator.prototype.getReleaseDuration = function () {
    if (this.envelope && this.envelope.release && this.envelope.release.duration) {
        return this.envelope.release.duration;
    }
    return 0;
};

EnvelopeGenerator.prototype.trigger = function (time) {
    this.triggerTime = time || this.context.currentTime;
    this.applyEnvelope(this.envelope.attack, this.triggerTime);
};

EnvelopeGenerator.prototype.release = function (time) {
    this.releaseTime = time || this.context.currentTime;
    this.applyEnvelope(this.envelope.release, this.releaseTime);
};

EnvelopeGenerator.prototype.connect = function (parameter) {
    this.connections.push(parameter);
};
EnvelopeGenerator.prototype.disconnect = function () {
    this.connections.disconnect();
};


export default EnvelopeGenerator;
