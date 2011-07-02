function ControlledValue(initialValue) {
	if (!!initialValue) {
		this.value = initialValue;
	} else {
		this.value = 0;
	}
	this.controllers = [];
	this.afterUpdate = function () {};
	
}

ControlledValue.prototype.addController = function (controller) {
	this.controllers.push(controller);
};

ControlledValue.prototype.setValue = function (newValue) {
	var i;
	this.value = newValue;
	for (i = 0; i < this.controllers.length; i += 1) {
		this.controllers[i].update();
	}
	this.afterUpdate();
};
