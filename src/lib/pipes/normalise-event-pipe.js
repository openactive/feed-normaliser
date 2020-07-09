import Pipe from './pipe.js';
import Utils from '../utils.js';
import NormalisedEvent from '../normalised-event.js';

// Normalises an object with a type of Event
class NormaliseEventPipe extends Pipe {
  run(){
    return new Promise(async resolve => {

        console.log(`Running ${this.rawData.id} (${this.rawData.type}) through ${this.constructor.name}`);
        let type = this.getType();
        let kind = this.getKind();

        if (type == 'Event' || type == 'OnDemandEvent'){
            // The top level event is the Event

            this.doCleanup();
            let normalisedEvent = new NormalisedEvent(this.rawData, kind);
            this.normalisedEvents.push(normalisedEvent);

        }
        else if (typeof this.rawData.subEvent !== 'undefined'){
            // There are subEvents. If any are Event type, we normalise them.
            // This is expected to catch EventSeries and HeadlineEvent
            // TODO: if an Event has subEvents do we throw away the parent?
            //       in the same way we do for other types?

            let eventSubEvents = false;
            let subEvents = Utils.ensureArray(this.rawData.subEvent);

            for (let subEvent of subEvents){
                let type = this.getType(subEvent);
                if(type == "Event" || type == "OnDemandEvent"){
                    // We only want to continue processing if any of the subEvents
                    // are the right type
                    eventSubEvents = true;
                    break;
                }
            }

            if (eventSubEvents){
                this.doCleanup();
                let {subEvent, ...parentEvent} = this.rawData;
                parentEvent["@type"] = "Event";

                // Combine parent event data with each subEvent to make NormalisedEvents
                // Any properties that are on both the subEvent and the parent will take the
                // value from the subEvent
                for (let sub of subEvent){
                    delete sub.type;
                    let normalisedEventData = {
                        ...parentEvent,
                        ...sub
                    }
                    let normalisedEvent = new NormalisedEvent(normalisedEventData, kind);
                    this.normalisedEvents.push(normalisedEvent);
                }
            }
        }

        resolve(this.normalisedEvents);
    });
  }

}

export default NormaliseEventPipe;