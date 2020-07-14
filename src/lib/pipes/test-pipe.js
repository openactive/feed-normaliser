import Pipe from './pipe.js';
import NormalisedEvent from '../normalised-event.js';

/** This Test pipeline simply creates some Normalised Events as a guideline for devs making other pipelines.
    If you want to run it, uncomment it in index.js
    **/
class TestPipe extends Pipe {
  run(){
    return new Promise(async resolve => {

      console.log(`Running ${this.rawData.id} (${this.rawData.type}) through ${this.constructor.name}`);

      // Check for a type and set if none
      let type = "TestEvent";
      if(typeof this.rawData["@type"] !== 'undefined'){
        type = this.rawData["@type"];
      }else if(typeof this.rawData.type !== 'undefined'){
        type = this.rawData.type;
      }

      // Make it into two events
      let event1 = {...this.rawData};
      let event2 = {...this.rawData};
      event1.type = type;
      event2.type = type;

      // Set something distinguishing
      event1.extra = "a test";
      event2.extra = "b test";

      // Create NormalisedEvent objects
      let normalisedEvent1 = new NormalisedEvent(event1, "TestKind");
      this.normalisedEvents.push(normalisedEvent1);

      let normalisedEvent2 = new NormalisedEvent(event2, "TestKind");
      this.normalisedEvents.push(normalisedEvent2);

      resolve(this.normalisedEvents);
    });
  }
}

export default TestPipe;