var assert = require('chai').assert;

const Segment = require('../Segment').Segment;
const Generator = require('../Segment').Generator;


describe("segment", ()=>{
  it("should not smoke", ()=>{
    let s1 = new Segment(1, 0, {});
    s1.render();
  });


  it("should render child segment", ()=>{
    let par_seg = new Segment(0);
    let child_seg = new Generator(()=>{
      return [{time: 1}];
    })
    par_seg.addSegment(child_seg);
    assert.deepEqual(par_seg.render(), [{time: 1}]);
  });
  
  it("should render child segment with offset", ()=>{
    let par_seg = new Segment(0);
    let child_seg = new Generator(()=>{
      return [{time: 1}];
    })
    par_seg.addSegment(child_seg, 1);
    assert.deepEqual(par_seg.render(), [{time: 2}]); 
  });
  
  it("should render parent, arg, and child offsets", ()=>{
    let par_seg = new Segment(1);
    let child_seg = new Generator(()=>{
      return [{time: 1}];
    }, 1)
    par_seg.addSegment(child_seg, 1);
    assert.deepEqual(par_seg.render(), [{time: 4}]); 
  });
  
  it("should not change child segment", ()=>{
    let par_seg = new Segment(0);
    let child_seg = new Generator(()=>{
      return [{time: 1}];
    }, 1) 
    par_seg.addSegment(child_seg, 4);
    assert.equal(child_seg.time, 1);

  });

  it("should respect nested offsets", ()=>{
    let gpar_seg = new Segment(1);
    let par_seg = new Segment(1);
    let child_seg = new Generator(()=>{
      return [{time: 1}];
    }, 1) 
    gpar_seg.addSegment(par_seg, 1);
    par_seg.addSegment(child_seg, 1);

    assert.deepEqual(gpar_seg.render(), [{time:6}]);

  })
  
  it("should return events that fit within a timeframe", ()=>{
    let par_seg = new Segment(0);
    let child_seg = new Generator(()=>{
      return [{time: 1}, {time: 3}];
    }, 0);
    par_seg.addSegment(child_seg, 0);

    par_seg.render();
    par_seg.playing = true;
    par_seg.getEventsAt(0);

    assert.deepEqual(
      par_seg.getEventsAt(2),
      [{time:1}]
    )

  });
  
});

describe("generator", ()=>{
  it("should generate", ()=>{
    let generator = new Generator(()=>{
      return [{time: 1}];
    })
    assert.deepEqual(generator.render(), [{time: 1}]);
  });

  it("should generate offset messages given a start time", ()=>{
    let generator = new Generator(()=>{
      return [{time: 1}];
    }, 5);
  
    assert.deepEqual(generator.render(), [{time: 6}]);
  });
})
