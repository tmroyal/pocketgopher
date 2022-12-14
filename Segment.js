class Segment {
  segments = [];
  
  constructor(duration, time, executer){
    this.executer = executer;
    this.duration = duration;
    this.time = time || 0;
    this.segments = [];
    this.events = [];
    this.playing = false;
    this.eventTime = null;
  }

  addSegment(segment, time){
    const segmentCopy = { ...segment };
    Object.setPrototypeOf(segmentCopy, Object.getPrototypeOf(segment));
    segmentCopy.time += time || 0;
    this.segments.push(segmentCopy);
    return this;
  }

  getEventsAt(endTime){
    if (!this.playing){
      return [];
    }
    let res = [];
    if (this.eventTime === null){
      this.eventTime = endTime;
    } else {
      res = this.events.filter((event)=>{
        return event.time >= this.eventTime && event.time < endTime;
      });
      this.eventTime = endTime;
    }
    return res;
  }

  play(executer, time){
    if (this.playing){ return; }

    this.render();
    this.eventTime = null;
    this.playing = true; 

    if (executer){
      executer.play(this, time);
    } else if (this.executer){
      this.executer.play(this, time);
    } else {
      throw "Segment.play: executer not defined";
    }
  }

  stop(executer){
    this.playing = false;
    if (executer){
      executer.stop(this);
    } else if (this.executer){
      this.executer.stop(this);
    } else {
      throw "Segment.stop: executer not defined";
    }
  }

  render(){
    this.events = this.segments
      .map(segment=> segment.render())
      .flat()
      .sort((a,b)=>{
        return a.time - b.time;
      });
    this.events.forEach((event)=>{
      event.time += this.time;
    });
    return this.events;
  }
}

class Generator extends Segment {
  constructor(method, duration, startTime, executer){
    super(duration, startTime, executer);
    this.method = method;
  }

  addSegment(segment, props){
    throw "Generator.addSegment: cannot nest segments in a generator";
  }

  render(){
    const events = this.method(this)
          .flat()
          .sort((a,b)=>{
            return a.time - b.time;
          });

    events.forEach((event)=>{
      event.time += this.time;
    });
    return events;
  }
}

module.exports = {
  Segment: Segment,
  Generator: Generator
};
