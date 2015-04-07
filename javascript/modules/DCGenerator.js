"use strict";
var DCGenerator = function (context) {
    var gen;
    var real = new Float32Array([0, 1]);
    var imag = new Float32Array([0, 0]);

    gen = context.createOscillator();
    gen.type = 'custom';
    gen.setPeriodicWave(context.createPeriodicWave(real, imag));
    gen.frequency.value = 0;
    gen.start();
    this.generator = gen;
};

DCGenerator.prototype.connect = function (node) {
    if (node.hasOwnProperty('input')) {
        this.generator.connect(node.input);
    } else {
        this.generator.connect(node);
    }
};
module.exports = DCGenerator;
