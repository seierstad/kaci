/*global require, module, document */

"use strict";
var SVGControllerElement = require('./SVGControllerElement'),
    utils = require('./ViewUtils');

var svgns = 'http://www.w3.org/2000/svg';

var EnvelopeView = function (ctx, data, params) {
    if (!params) {
        params = {};
    }
    var callback = params.callback,
        updateEventHandler,
        that;

    this.context = ctx;
    this.circles = utils.svg('g', {
        'class': 'circles'
    });
    this.lines = utils.svg('g', {
        'class': 'lines'
    });
    this.envId = params.id || 'envelope';

    this.pointRadius = '10';
    this.points = [];
    this.minValue = params.minValue || 0;
    this.maxValue = params.maxValue || 1;

    params.width = params.width || '300px';
    params.height = params.height || '300px';

    this.controller = new SVGControllerElement(params);
    this.controller.appendChild(this.lines);
    this.controller.appendChild(this.circles);

    this.update(data);

    updateEventHandler = function (event) {
        switch (event.detail.type) {
        case "move":
            this.movePoint(event.detail.index, event.detail.data);
            break;
        case "add":
            this.addPoint(event.detail.index, event.detail.data);
            this.circleDraggable(event.detail.index);
            break;
        case "delete":
            this.deletePoint(event.detail.index);
            break;
        default:
            this.update(event.detail);
            break;
        }
    };

    ctx.addEventListener(this.envId + '.changed.data', updateEventHandler.bind(this));
    that = this;
    this.controller.addEventListener('mousedown', this.mouseHandler.bind(this), false);
    this.controller.addEventListener('mouseup', this.mouseHandler.bind(this), false);
    this.controller.addEventListener('mousemove', this.mouseHandler.bind(this), false);
    this.controller.addEventListener('touchstart', this.touchHandler.bind(this), false);
    this.controller.addEventListener('touchend', this.touchHandler.bind(this), false);
    this.controller.addEventListener('touchcancel', this.touchHandler.bind(this), false);
    this.controller.addEventListener('touchmove', this.touchHandler.bind(this), false);
    return this.controller;
};
EnvelopeView.prototype.getPosition = function (data) {
    return {
        x: data.x,
        y: 1 - (data.y - this.minValue) / this.maxValue
    };
};
EnvelopeView.prototype.movePoint = function (index, data) {
    this.points[index].position = this.getPosition(data);
    this.points[index].circle.setAttribute("cy", ((1 - data.y) * 100).toString() + "%");
    if (this.points[index].line) {
        this.points[index].line.setAttribute("y2", ((1 - data.y) * 100).toString() + "%");
    }
    if (index + 1 < this.points.length && this.points[index + 1].line) {
        this.points[index + 1].line.setAttribute("y1", ((1 - data.y) * 100).toString() + "%");
    }

    if (index > 0 && index + 1 < this.points.length) {
        this.points[index].circle.setAttribute("cx", (data.x * 100).toString() + "%");
        if (this.points[index].line) {
            this.points[index].line.setAttribute("x2", (data.x * 100).toString() + "%");
        }
        if (index + 1 < this.points.length && this.points[index + 1].line) {
            this.points[index + 1].line.setAttribute("x1", (data.x * 100).toString() + "%");
        }
    }
};
EnvelopeView.prototype.addPoint = function (index, data) {
    var position,
        point;

    position = this.getPosition(data);

    if (this.points.length > index) {
        // update line to next point
        this.line(position, this.points[index].position, this.points[index].line);
    }

    point = {
        position: position,
        circle: this.circle(position)
    };
    this.points.splice(index, 0, point);



    if (index > 0) {
        // draw line to previous point
        point.line = this.line(this.points[index - 1].position, position);
        this.lines.appendChild(point.line);
    }
    this.circles.appendChild(point.circle);

};
EnvelopeView.prototype.deletePoint = function (index) {
    this.circles.removeChild(this.points[index].circle);
    this.points[index].circle = null;

    if (index > 0) {
        this.lines.removeChild(this.points[index].line);
        this.points[index].line = null;

        if (this.points[index + 1]) {
            this.line(this.points[index - 1].position, this.points[index + 1].position, this.points[index + 1].line);
        }
    }
    this.points[index].position = null;

    this.points.splice(index, 1);

};
EnvelopeView.prototype.update = function (data) {
    var position,
        previousPosition,
        i,
        svgCircle,
        svgLine,
        circleGroup,
        lineGroup;

    function xy(arr) {
        return {
            x: arr[0],
            y: arr[1]
        };
    }

    for (i = 0; i < this.points.length && i < data.length; i += 1) {
        this.movePoint(i, xy(data[i]));
    }
    while (i < data.length) {
        this.addPoint(i, xy(data[i++]));
    }
    while (i < this.points.length) {
        this.deletePoint(i);
    }
    return this;
};
EnvelopeView.prototype.line = function (startPosition, endPosition, modifyLine) {
    var svgLine = modifyLine || document.createElementNS(svgns, "line");

    svgLine.setAttribute("x1", (startPosition.x * 100).toString() + "%");
    svgLine.setAttribute("y1", (startPosition.y * 100).toString() + "%");
    svgLine.setAttribute("x2", (endPosition.x * 100).toString() + "%");
    svgLine.setAttribute("y2", (endPosition.y * 100).toString() + "%");

    return svgLine;
};

EnvelopeView.prototype.circle = function (position, modifyCircle) {
    var svgCircle = modifyCircle || document.createElementNS(svgns, "circle");

    svgCircle.setAttribute("cx", (position.x * 100).toString() + "%");
    svgCircle.setAttribute("cy", (position.y * 100).toString() + "%");
    svgCircle.setAttribute("r", this.pointRadius + "px");

    return svgCircle;
};
EnvelopeView.prototype.circleIndex = function (event, touch) {
    var p = touch || event,
        i;
    for (i = 0; p.target !== this.points[i].circle && i + 1 < this.points.length; i += 1) {}
    if (p.target === this.points[i].circle) {
        return i;
    }
    return -1;
};
EnvelopeView.prototype.circleDraggable = function (index) {
    this.points[index].draggable = true;
    this.points[index].circle.setAttribute("r", this.pointRadius * 3 + "px");
};
EnvelopeView.prototype.changeHandler = function (event, touch) {
    var pixelCoordinates,
        svgSize,
        newData,
        circleDraggable,
        index,
        i = 0,
        changeEvent;

    pixelCoordinates = utils.cursorPosition(event, touch);
    svgSize = utils.sizeInPixels(this.controller);
    newData = {
        x: pixelCoordinates.x / svgSize.width,
        y: 1 - pixelCoordinates.y / svgSize.height
    };

    switch (event.type) {
    case "touchstart":
    case "mousedown":
        if (event.target.tagName === "rect") {
            for (i = 0; newData.x > this.points[i].position.x && i < this.points.length; i += 1) {}
            changeEvent = new CustomEvent(this.envId + '.change.data', {
                'detail': {
                    'type': 'add',
                    'index': i,
                    'data': newData
                }
            });
        } else if (event.target.tagName === "circle") {
            index = this.circleIndex(event);
            if (event.shiftKey || event.altKey || event.metaKey || event.which === 3 || event.which === 2 || event.ctrlKey) {
                if (index > 0 && index + 1 < this.points.length) {
                    changeEvent = new CustomEvent(this.envId + '.change.data', {
                        'detail': {
                            'type': 'delete',
                            'index': index
                        }
                    });
                    /*                  event.preventDefault();
                                        event.stopPropagation();
                    */
                }
            } else {
                this.circleDraggable(index);
            }
        }
        break;
    case "touchend":
    case "touchcancel":
    case "mouseup":
        index = this.circleIndex(event);
        if (this.points[index] && this.points[index].draggable) {
            this.points[index].draggable = false;
            this.points[index].circle.setAttribute("r", this.pointRadius + "px");
        }
        break;
    case "touchmove":
        if (pixelCoordinates.x < 0 || pixelCoordinates.y < 0 || pixelCoordinates.x >= svgSize.width || pixelCoordinates.y >= svgSize.height) {

            return touchLeaveHandler(event);
        }
        break;
    case "mousemove":
        if (event.target.tagName === "circle") {
            event.preventDefault();
            event.stopPropagation();
            index = this.circleIndex(event);

            if (this.points[index] && this.points[index].draggable) {
                changeEvent = new CustomEvent(this.envId + '.change.data', {
                    'detail': {
                        'type': 'move',
                        'index': index,
                        'data': newData
                    }
                });

            }
        }
        break;
    }
    if (changeEvent) {
        this.context.dispatchEvent(changeEvent);
    }
    return false;
};
EnvelopeView.prototype.mouseHandler = function (event) {
    this.changeHandler(event);
};

EnvelopeView.prototype.touchHandler = function (event) {
    this.changeHandler(event, event.changedTouches[0]);
    return false;
};

module.exports = EnvelopeView;
