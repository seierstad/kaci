var phase = 0;
var buffer = null;
var sampleFreq = null;
var bufferSize = 0;
var counter = 0;
noteEnd = function () {
  postMessage({msg: 'set inactive'});  
  postMessage({cmd: 'setStatus', msg: 'inactive'});
  phase = 0;
};
getSignal = function (size) {
  var i, j;
  for (i = 0, j = size; i < j; i += 1) {
    buffer[i] = Math.sin(phase * Math.PI * 2);
    phase += frequency / sampleFreq;
    while (phase > 1) {
      phase -= 1;
    }
  }
  postMessage({cmd: 'status', msg: {counter: counter++, phase: phase, frequency: frequency, sampleFreq: sampleFreq}});
  postMessage({d: buffer});
};
addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'setup':
      phase = 0;
      sampleFreq = data.sampleFreq;
      bufferSize = data.bufferSize;
      postMessage('bsize: ' + bufferSize);      
      buffer = new Float32Array(bufferSize);
      postMessage('sample frequency set to ' + sampleFreq);
      break;
    case 'keydown':
      phase = 0;
      frequency = data.frequency;
      postMessage({cmd: 'setStatus', msg: 'active'});
      break;
    case 'keyup':
      postMessage('tangent opp');
      setTimeout(self.noteEnd, 1000);
      break;
    case 'terminate':
      close(); // Terminates the worker.
      break;
    case 'fillBuffer':
      getSignal(e.data.size);
      break;
    case 'setFrequency':
      frequency = data.frequency;
      break;
  };
}, false);

postMessage('worker created');