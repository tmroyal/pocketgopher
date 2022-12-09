module.exports = function MakeGlobalMidiNotes(midCOct){
  const diff = midCOct - 5; // 60/12 is 5
  const notes = {
    '0': 'C',
    '2': 'D',
    '4': 'E',
    '5': 'F',
    '7': 'G',
    '9': 'A',
    '11': 'B'
  };

  for (let i = 0; i < 127; i++){
    let note = notes[i % 12];
    let noteSharp = notes[i % 12 - 1];
    let noteFlat = notes[i % 12 + 1];
  
    let oct = Math.floor(i/12) + diff;
  
    console.log(i, note, noteSharp, noteFlat);
    if (note) {
      global[note+oct] = i;
    }
    if (noteSharp) {
      global[noteSharp+"s"+oct] = i;
    }
    if (noteFlat) {
      global[noteFlat+"b"+oct] = i;
    }
    
  }
}
