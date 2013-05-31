(function () {
	var voixeStartedLogger,	
		voiceEndedLogger,
		voiceDroppedLogger,
		unmappedKeyLogger;

voiceStartedLogger = function (event, data) {
	console.log('handler: ' + data.causedById + ' started note ' + data.noteId + ' at voice ' + data.voiceId);
};

voiceEndedLogger = function (event, data) {
	console.log('handler: ' + data.causedById + ' ended note ' + data.noteId + ' at voice ' + data.voiceId);
};

unmappedKeyLogger = function (event, data) {
	console.log('unmapped key ' + data.keyCode + ' pressed');
};


PubSub.subscribe('voice.started', voiceStartedLogger);
PubSub.subscribe('voice.ended', voiceEndedLogger);
PubSub.subscribe('voice.dropped', voiceDroppedLogger);
PubSub.subscribe('control.change.keyboard.unmappedKey', unmappedKeyLogger);
}());