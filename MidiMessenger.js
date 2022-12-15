const easymidi = require('easymidi');

class MidiMessenger {
  constructor(portName){
    this.portName = portName;
    this.output = new easymidi.Output(portName, true)
  }

  panic(){
    for (let channel = 0; channel < 16; channel++){
      for (let note = 0; note < 128; note++){
        this.output.message('noteoff', {
          note: note,
          velocity: 64,
          channel: channel
        });
      }
    }
  }

  message(event){
    const type = event.type;
    delete event.type;
    delete event.time;
    this.output.send( type, event );
  }
}

module.exports = {
  MidiMessenger: MidiMessenger
}