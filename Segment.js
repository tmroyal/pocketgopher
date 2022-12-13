class Segment {
  segments = [];
  
  constructor(duration, time, executer){
    this.executer = executer;
    this.duration = duration;
    this.time = time || 0;
    this.segments = [];
    this.events = [];
  }

  addSegment(segment, time){
    const segmentCopy = { ...segment };
    Object.setPrototypeOf(segmentCopy, Object.getPrototypeOf(segment));
    segmentCopy.time += time || 0;
    this.segments.push(segmentCopy);
    return this;
  }

  getEventsAt(time){
    /* 
      - first, we store the incoming time
      - we will trigger all events that happened between 
        prev time and incoming time
      - we will need to consider an offset, as the time is zero based
        but the segment might start later (yet all event times are rel to )
      - we dont want to render all events if we start in medias res
    */
  }

  play(executer){
    this.render();
    if (executer){
      executer.play(this);
    } else if (this.executer){
      this.executer.play(this);
    } else {
      throw "Segment.play: executer not defined";
    }
  }

  stop(executer){
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
