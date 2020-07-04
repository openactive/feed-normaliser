import Pipe from './pipe.js';
import NormalisedEvent from '../normalised-event.js';

// Normalises an object with a type of Event
class NormaliseEventPipe extends Pipe {
  run(){
    return new Promise(async resolve => {

      let normalisedEvent1 = new NormalisedEvent({
        }, "Event");
      console.log(this.rawData.data);
      // this.normalisedEvents.push(normalisedEvent1);

      resolve(this.normalisedEvents);
    });
  }
}

export default NormaliseEventPipe;