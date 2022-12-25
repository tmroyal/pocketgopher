class Segment {
  segments = [];
  
  constructor(time, executer){
    this.executer = executer;
    this.time = time || 0;
    this.segments = [];
    this.appended = [];
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

  append(segment){
    const segmentCopy = { ...segment };
    Object.setPrototypeOf(segmentCopy, Object.getPrototypeOf(segment));

    this.appended.push(segmentCopy);
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

  play(time, executer){
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

  calculatedDuration(){
    if (!this.events || !this.events.length){
      this.render(); 
      // if there are no events
      if (this.events.length == 0){ return 0; }
    }
    // here, events are midi messages and the like, not notes or trajectories
    return this.lastEventTime() - this.time;
  }

  lastEventTime(){
    const lastEvent = this.events[this.events.length - 1];
    if (!lastEvent){ return this.time;}
    return lastEvent.time;
  }

  getAdjustedEvents(source, timeOffset) {
    const adjustedEvents = source
            .map(segment => segment.render())
            .flat()
            .sort((a,b)=>{
              return a.time - b.time;
            })
            
    adjustedEvents.forEach((ev)=>{
      ev.time += timeOffset;
    })

  }

  adjustEvents(events, offset) {
    const newEvents = events.flat();
    newEvents.sort((a,b)=>{
      return a.time - b.time;
    });
    newEvents.forEach((ev)=>{
      ev.time += offset;
    })
    return newEvents;
  }

  render(){
    // first render everything in this.segments and
    // their children
    this.events = this.adjustEvents(
      this.segments.map(segment=> segment.render()),
      this.time);
    // then, based on current duration, render each event
    this.appended.forEach((segment)=>{
      let lastEvTime = this.lastEventTime();
      let appendedSegEvents = this.adjustEvents(segment.render(), lastEvTime);
      this.events = this.events.concat(appendedSegEvents);
    });

    return this.events;
  }
}

class Generator extends Segment {
  constructor(method, startTime, executer){
    super(startTime, executer);
    this.method = method;
  }

  addSegment(segment, props){
    throw "Generator.addSegment: cannot nest segments in a generator";
  }

  append(segment){
    throw "Generator.append: cannot append segments to generator"
  }

  render(){
    this.events = this.method(this)
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

module.exports = {
  Segment: Segment,
  Generator: Generator
};
