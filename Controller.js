var Controller = function (parentId, controlledValue, params) {
	this.container = document.getElementById(parentId);
	this.data = controlledValue;
	this.data.addController(this);

	this.controller = document.createElementNS(svgns, "svg");
	this.controller.setAttribute("version", "1.2");
	this.controller.setAttribute("class", "controller");
	this.controller.setAttribute("width", params.width);
	this.controller.setAttribute("height", params.height);
	this.controller.setAttribute("baseProfile", "tiny");
	this.touchArea = document.createElementNS(svgns, "rect");
	this.touchArea.setAttribute("x", "0");
	this.touchArea.setAttribute("y", "0");
	this.touchArea.setAttribute("width", "100%");
	this.touchArea.setAttribute("height", "100%");
	this.touchArea.setAttribute("opacity", "0");
	this.controller.appendChild(this.touchArea);
	this.container.appendChild(this.controller);

};
