import Pipe from './pipe.js';
import NormalisedEvent from '../normalised-event.js';

/** This Test pipeline simply creates some Normalised Events as a guideline for devs making other pipelines.
    If you want to run it, uncomment it in index.js
    **/
class TestPipe extends Pipe {
  run(){
    return new Promise(async resolve => {

      let normalisedEvent1 = new NormalisedEvent({
        "test": 1,
        "data": this.rawData.data
        }, "TestKind");

      this.normalisedEvents.push(normalisedEvent1);

      let normalisedEvent2 = new NormalisedEvent({
        "test": 2,
        "data": this.rawData.data
        }, "TestKind");
      this.normalisedEvents.push(normalisedEvent2 );

      resolve(this.normalisedEvents);
    });
  }
}

export default TestPipe;