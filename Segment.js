class Segment {
  segments = [];
  
  constructor(duration, startTime, executer){
    this.executer = executer;
    this.duration = duration;
    this.startTime = startTime || 0;
  }

  addSegment(segment, props){
    // should we not inject our executor?
  }

  getEventsAt(time){
    /* 
      - first, we store the incoming time
      - we will trigger all events that happened between 
        prev time and incoming time
      - search will be binary, and then extend linear
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
    // we render each event and then sort
    // is recursive
  }
}

class Generator extends Segment {
  constructor(method, duration, startTime, executer){
    this.method = method;
    super(duration, startTime, executer);
  }

  render(){
    return this.method(this.segments);
  }
}