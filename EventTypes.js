class Event { 
  constructor(time){ this.time = time; }
  render(){}
}

class Note extends Event {
  constructor({
    time = 0,
    note = 60,
    velocity = 0.5,
    duration = 1,
    channel = 0
  }) {
    super(time)
    this.note = note;
    this.velocity = velocity;
    this.duration = duration;
    this.channel = channel;
  }
  render(){
    // as an array, to start and end
    return [
      {
        type: 'noteon',
        channel: this.channel,
        note: this.note,
        velocity: this.velocity,
        time: this.time
      },
      {
        type: 'noteoff',
        channel: this.channel,
        note: this.note,
        velocity: this.velocity,
        time: this.time + this.duration
      }
    ]
  }
}
class CC extends Event {
  constructor({
    time = 0,
    cc = 60,
    value = 0.5,
    channel = 0 
  }) {
    super(time);
    this.cc = cc;
    this.value = value;
    this.channel = channel;
  }

  render (){
    return {
      type: 'cc',
      channel: this.channel,
      controller: this.cc,
      value: this.value,
      time: this.time
    }
  }
}

class CCTrajectory extends Event {
  constructor({
    time = 0,
    duration = 1,
    granularity = 1/60, // corresponds to step for renderer
    start = 0,
    end = 1,
    curve = 1,
    channel = 0,

  }) {
    if (curve <= 0 || granularity <= 0){
      throw "CCTrajectory(): curve and granularity must be greater than zero";
    }
    super(time);
    this.duration = duration;
    this.granularity = granularity;
    this.start = start;
    this.end = end;
    this.curve = curve;
  }
  
  render() {
    let loopTime = 0;
    const events = [];
    const event = {
      type: 'cc',
      time: this.time,
      channel: this.channel,
      controller: this.cc,
      value: this.start
    };

    while (loopTime < this.duration){
      event.time = this.determineTime(loopTime);
      event.value2 = this.determineValue(loopTime);

      events.push(Object.assign({}, event));

      time += this.granularity;
    }

    return events;
  }

  determineTime(loopTime){
    return loopTime+this.time;
  }

  determineValue(loopTime){
    const i = Math.pow(loopTime/this.duration, this.curve);
    return i*this.end + (1-i)*this.start;
  }
}