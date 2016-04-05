/*global require, module, document */

"use strict";
var SVGControllerElement = require('./SVGControllerElement'),
    utils = require('./ViewUtils'),
    EnvelopeView = require("./EnvelopeViewOld");

var svgns = 'http://www.w3.org/2000/svg';

var SustainEnvelopeView = function (ctx, patch, id) {
    var getValueAtTime,
        addSustain,
        removeSustain,
        setDurationBeforeSustain,
        setDurationAfterSustain,
        setSustainValue,
        test,
        view,
        initView,
        isFinishedAtTime;

    this.id = id;
    this.attack = {
        'data': patch.attack
    };
    this.release = {
        'data': patch.release
    };
    this.sustain = {
        'data': patch.sustain
    };
    this.controller = new SVGControllerElement(params);
    this.controller.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    }, false);
    var params = {
        container: this.controller,
        width: "40%",
        height: "90%",
        id: this.id + '.attack'
    };

    this.attack.view = new EnvelopeView(ctx, this.attack.data.steps, params);
    //    this.controller.appendChild(this.attack.view);

    params.offsetX = "60%";
    params.id = this.id + '.release';
    this.release.view = new EnvelopeView(ctx, this.release.data.steps, params);
    //    this.controller.appendChild(this.attack.view);

    var sustainBarElement = function () {
        var sustainController,
            defs,
            mask,
            maskbg,
            maskText,
            bar,
            rect,
            off,
            offBg,
            offTarget,
            sustainPercent,
            sustainOff,
            crossline1,
            crossline2,
            useOff,
            useBar,
            svgns = 'http://www.w3.org/2000/svg',
            xlinkns = 'http://www.w3.org/1999/xlink';

        sustainController = utils.svg("g");

        mask = utils.svg('mask', {
            id: 'mask',
            x: 0,
            y: 0,
            width: "100%",
            height: 20
        });
        maskbg = utils.svg('rect', {
            width: '100%',
            height: '100%',
            fill: 'pink'
        });
        mask.appendChild(maskbg);
        maskText = utils.svg('text', {
            x: 0,
            y: 0,
            transform: 'translate(0 15)',
            fill: 'black'
        });
        maskText.textContent = "SUSTAIN";
        mask.appendChild(maskText);
        offBg = utils.svg("circle", {
            cx: "100%",
            cy: 10,
            r: 7.5,
            transform: "translate(-7.5 0)"
        });
        mask.appendChild(offBg);
        sustainController.appendChild(mask);

        defs = document.createElementNS(svgns, "defs");
        bar = utils.svg('g', {
            id: 'sustainBar'
        });
        rect = utils.svg('rect', {
            width: '100%',
            height: 20,
            x: 0,
            y: 0,
            mask: 'url(#mask)',
            'class': 'bar'
        });
        bar.appendChild(rect);

        off = utils.svg('g', {
            id: 'off'
        });
        offTarget = utils.svg('circle', {
            id: 'target',
            cx: 7.5,
            cy: 7.5,
            r: 7.5,
            opacity: 0
        });
        off.appendChild(offTarget);
        crossline1 = utils.svg('line', {
            x1: 3.5,
            y1: 3,
            x2: 11.5,
            y2: 12
        });
        off.appendChild(crossline1);
        crossline2 = utils.svg('line', {
            x1: 3.5,
            y1: 12,
            x2: 11.5,
            y2: 3,
            fill: 'blue'
        });
        off.appendChild(crossline2);
        defs.appendChild(off);

        useOff = utils.svg('use', {
            x: '100%',
            y: 2.5,
            transform: 'translate(-15 0)'
        });
        useOff.setAttributeNS(xlinkns, "xlink:href", "#off");
        bar.appendChild(useOff);

        defs.appendChild(bar);
        sustainController.appendChild(defs);

        sustainPercent = (this.sustain.value * 100).toString() + "%";

        useBar = utils.svg('use', {
            x: 0,
            y: sustainPercent,
            transform: 'translate(0 -10)'
        });
        useBar.setAttributeNS(svgns, "svg:transform", "scale(1 -1)");
        useBar.setAttributeNS(xlinkns, "xlink:href", "#sustainBar");

        sustainController.appendChild(useBar);
        sustainController.updatePosition = function (position) {
            useBar.setAttribute("y", (position * 100) + "%");
        };
        return sustainController;
    };
    this.sustain.value = this.release.data.steps[0][1];


    params.width = "20%";
    params.offsetX = "40%";
    params.className = "sustain";
    // tester ribbon
    params.dataObject = this.sustain.data;
    params.controlledValue = "value";
    params.minValue = 0;
    params.maxValue = 1;
    params.callback = (function () {
        return function () {
            /*            beforeSustain.envelope.setLastValue(sustain.value);
            afterSustain.envelope.setValueAtIndex(sustain.value, 0);
            beforeSustain.envelope.view.update();
            afterSustain.envelope.view.update();
*/
        };
    })();

};
/*
SustainEnvelopeView.prototype.setSustainValue = function (value) {
    if (sustain.enabled) {
        sustain.value = value;
        beforeSustain.envelope.setLastValue(value);
        afterSustain.envelope.setValueAtIndex(value, 0);

        beforeSustain.envelope.view.update();
        afterSustain.envelope.view.update();
    }
};

SustainEnvelopeView.prototype.addSustain = function (index) {
    var duration = beforeSustain.duration,
        data = beforeSustain.envelope.getData(),
        beforeData,
        beforePart,
        afterData,
        afterPart,
        i;

    if (index < data.length) {
        if (sustain.enabled) {
            removeSustain();
        }

        afterData = data.slice(index);
        beforeData = data.slice(0, index);
        beforeData.push(afterData[0].slice());

        beforePart = data[index][0];
        afterPart = 1 - beforePart;

        for (i = 0; i < beforeData.length; i += 1) {
            beforeData[i][0] = beforeData[i][0] / beforePart;
        }
        for (i = 0; i < afterData.length; i += 1) {
            afterData[i][0] = (afterData[i][0] - beforePart) / afterPart;
        }
        beforeSustain.envelope.setData(beforeData);
        afterSustain.envelope.setData(afterData);
        beforeSustain.duration = duration * beforePart;
        afterSustain.duration = duration - beforeSustain.duration; // equals duration * afterPart
        sustain.enabled = true;
        sustain.value = data[index][1];
        view.update();
    }
    return this;
};

SustainEnvelopeView.prototype.removeSustain = function () {
    if (this.sustain.enabled) {
        var duration = beforeSustain.duration + afterSustain.duration,
            data,
            beforeData = beforeSustain.envelope.getData(),
            beforePart = beforeSustain.duration / duration,
            afterData = afterSustain.envelope.getData(),
            afterPart = 1 - beforePart,
            i;

        beforeData.pop();

        for (i = 0; i < beforeData.length; i += 1) {
            beforeData[i][0] = beforeData[i][0] * beforePart;
        }
        for (i = 0; i < afterData.length; i += 1) {
            afterData[i][0] = beforePart + (afterData[i][0] * afterPart);
        }
        data = beforeData.concat(afterData);
        beforeSustain.envelope.setData(data);
        beforeSustain.duration = duration;
        sustain.enabled = false;
        view.update();
    }

    return this;
};

initView = function (params) {



    params.valueIndicator = sustainBarElement();
    params.invertedView = false;
    synth.ribbon(params);

};

};
*/

module.exports = SustainEnvelopeView;