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

describe("calculated duration", ()=>{
  it("should return a proper duration for segments", ()=>{
    let generator = new Generator(()=>{
      return [{time: 1}];
    }, 5);
    let segment = new Segment(2);
    segment.addSegment(generator);

    assert.equal(segment.calculatedDuration(), 6)
  });
  it("should return a proper duration for generators", ()=>{
    let generator = new Generator(()=>{
      return [{time:1}];
    }, 5)
    assert.equal(generator.calculatedDuration(), 1);
  });
  it("should return a proper duration for multiple segments", ()=>{
    let generator = new Generator(()=>{
      return [{time:1}];
    }, 2);
  
    let gen2 = new Generator(()=>{
      return [{time:1}];
    }, 3);
  
    let segment = new Segment();
    segment.addSegment(generator);
    segment.addSegment(gen2);

    assert.equal(segment.calculatedDuration(), 4);
  });
  it("should return a proper duration for nested segments", ()=>{
    let generator = new Generator(()=>{
      return [{time:1}];
    }, 2);
  
    let segment = new Segment();
    let nestedSegment = new Segment(1);
    nestedSegment.addSegment(generator);
    segment.addSegment(nestedSegment);
  
    assert.equal(segment.calculatedDuration(), 4)

  });

  it("should return zero with no events", ()=>{
    let segment = new Segment(1);
    assert.equal(segment.calculatedDuration(), 0);
  })


  it("should return zero with only one events", ()=>{
    let generator = new Generator(()=>{
      return [{time:1}];
    })
    let segment = new Segment(1);
    assert.equal(segment.calculatedDuration(), 0);
  })
});


describe("Segment.append", ()=>{
  it("should append one segment sequentially", ()=>{
    const generator = new Generator(()=>{
      return [ {time: 1} ]
    }, 1);
    const segment = new Segment();
    const segment2 = new Segment();
  
    segment.addSegment(generator);
    segment2.addSegment(generator);
  
    segment.append(segment2);
    segment.render();

    assert.deepEqual(segment.events, [
      {time: 2}, {time: 4}
    ]);
  });
  it("should append a nested segment sequentially", ()=>{
    let g1 = new Generator(()=>{
      return [{time:1}]
    }, 1);
    let seg1 = new Segment(0);
    seg1.addSegment(g1);

    let seg2 = new Segment(1);
    seg2.addSegment(g1);

    seg1.append(seg2);
  
    seg1.render();
  
    assert.deepEqual(seg1.events, [
      {time:2}, {time: 5}
    ])
  });
  it("should correctly append segment after a nested segment", ()=>{
    let g1 = new Generator(()=>{
      return [{time:1}];
    }, 1);
    let seg1 = new Segment(0);
    let seg2 = new Segment(1);
  
    seg2.addSegment(g1);
    seg1.addSegment(seg2);

    let seg3 = new Segment(1);
    seg3.addSegment(g1);

    seg1.append(seg3);
    seg1.render();
  
    assert.deepEqual(seg1.events, [
      {time: 3}, {time: 6}
    ])
  });
  it("should work when called twice", ()=>{
    let g1 = new Generator(()=>{
      return [{time:1}];
    });
    let seg1 = new Segment(0);
    seg1.addSegment(g1);
    seg1.append(g1);
    seg1.append(g1);
  
    seg1.render();
  
    assert.deepEqual(seg1.events, [
      {time: 1}, {time:2}, {time: 3}
    ])
  }); 
  it("should work when called when there are zero child segments", ()=>{
    let g1 = new Generator(()=>{
      return [{time:1}]
    }, 0);
    let seg1 = new Segment(0);

    seg1.append(g1);
    seg1.render();

    assert.deepEqual(seg1.events, [
      {time: 1}
    ])
  });
  it("should work with a delayed parent segment", ()=>{
    let g1 = new Generator(()=>{
      return [{time:1}]
    }, 1);
    let seg1 = new Segment(1); 
  
    seg1.append(g1);
    seg1.render();

    assert.deepEqual(seg1.events, [
      {time: 3}
    ])
  });

  it("should throw when called form a generator", ()=>{
    const g1 = new Generator(()=>{});
    assert.throws(()=>{
      g1.append(g1)
    })
  });
})