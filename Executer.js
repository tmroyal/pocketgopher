class Timer {
  constructor() {
    if (this.constructor.name == 'Time'){
      throw "Attempt to instantiate 'virtual' class Timer";
    }
    this.start = 0;
    this.playing = false;
  }
  play() {
    if (!this.tick){
      throw "Time.play: must call setTick before playing";
    }
    this.start = performance.now();
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
    return performance.now() - this.start;
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
  constructor(){
    if (this.constructor.name == 'Executer'){
      throw("Cannot instantiate 'virtual' class Executer")
    }
  }
  play(segment) {
    this.timer.setTick((time) => {
      const events = segment.getEventsAt(time);
      if (events.length) {
        events.forEach((event) => {
          event.do();
        });
      }
    });
    this.timer.play();
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
  constructor(){
    this.timer = new PlayTimer();
  }
}

/*
 * Record timer is like play timer, but
 * It uses a high precision timer to ensure
 * Proper MTC syncing
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
