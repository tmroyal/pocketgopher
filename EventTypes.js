class Event { 
  constructor(time){ this.time = time; }
  render(){}
}

class Note extends Event {
  constructor(note, vel, duration, time){
    super(time);
    this.note = note || 60;;
    this.vel = vel || 60;
    this.duration = duration || 1;
  }
  render(){
    // as an array, to start and end
  }
}
class CC extends Event {

}
class CCTrajectory extends Event {}
// Compose the below out of the above
class CCMultiTrajectory extends Event {}