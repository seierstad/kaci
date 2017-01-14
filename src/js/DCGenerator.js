"use strict";
let DCGenerator = function (context) {
    const real = new Float32Array([0, 1]);
    const imag = new Float32Array([0, 0]);

    const gen = context.createOscillator();
    gen.setPeriodicWave(context.createPeriodicWave(real, imag));
    gen.frequency.value = 0;
    if (gen.type !== "custom") {
        gen.type = "custom";
    }
    gen.start();
    this.generator = gen;
};

DCGenerator.prototype.connect = function (node) {
    if (node.hasOwnProperty("input")) {
        this.generator.connect(node.input);
    } else {
        this.generator.connect(node);
    }
};
DCGenerator.prototype.destroy = function destroyDCGenerator () {
    this.generator.stop();
    this.generator.disconnect();
    this.generator = null;
};
export default DCGenerator;
