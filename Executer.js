class Timer {
  constructor() {
    if (this.constructor.name == 'Time'){
      throw "Attempt to instantiate 'virtual' class Timer";
    }
    this.start = 0;
    this.playing = false;
  }
  play(time) {
    if (!this.tick){
      throw "Time.play: must call setTick before playing";
    }
    this.start = performance.now()/1000.0 - (time || 0);
    this.playing = true;
    this.startTimer();
  }
  startTimer(){
    throw "Timer.startTimer is not implemented";
  }
  stop() {
    this.playing = false;
    this.stopTimer();
  }
  stopTimer(){
    throw "Timer.stopTimer is not implemented";
  }
  getTime() {
    return performance.now()/1000.0 - this.start;
  }
  setTick(cb) {
    this.tick = () => {
      cb(this.getTime());
    };
  }
  clearTick() {
    this.tick = null;
  }
}

class Executer {
  constructor(messenger){
    this.messenger = messenger;
    if (this.constructor.name == 'Executer'){
      throw("Cannot instantiate 'virtual' class Executer")
    }
  }
  play(segment, time) {
    this.timer.setTick((time) => {
      const events = segment.getEventsAt(time);
      if (events.length) {
        events.forEach((event) => {
          this.messenger.message(event);
        });
      }
      if (!segment.hasEventsAfter(time)){
        this.timer.stop();
      }
    });
    this.timer.play(time);
  }

  stop(segment) {
    this.timer.stop();
    this.timer.clearTick();
  }
}

class PlayTimer extends Timer {
  startTimer(){
    setInterval(this.tick, 1);
  }
  stopTimer(){
    clearInterval(this.tick);
  }
}

class PlayExecuter extends Executer {
  constructor(messenger){
    super(messenger);
    this.timer = new PlayTimer();
  }
}

/*
 * Record timer is like play timer, but
 * It uses a high precision timer to ensure
 * Proper MTC syncing
    TODO: make as a singleton to avoid double MTC timer stuff
 */

class RecordTimer extends Timer {
  constructor(){
    throw "RecordTimer not implemented";
  }
}
/* Record executer also sends MTC in addition to events 
 * Because it uses RecordTimer, it is more CPU intensive
 */
class RecordExecuter extends Executer {
  constructor(){
    throw "Record Executer not implemented";
    //this.timer = new RecordTimer();
  }

}

module.exports = {
  PlayExecuter: PlayExecuter,
  RecordExecuter: RecordExecuter
}