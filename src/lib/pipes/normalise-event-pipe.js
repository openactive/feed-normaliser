import Pipe from './pipe.js';
import Utils from '../utils.js';
import NormalisedEvent from '../normalised-event.js';

// Normalises an opportunity data object with the following types:
//  * Event
//  * OnDemandEvent
//  * SessionSeries
//  * ScheduledSession
class NormaliseEventPipe extends Pipe {
  run(){

    return new Promise(async resolve => {

        let id = this.getId();
        let type = this.getType();
        let kind = this.getKind();
        console.log(`Running ${id} (${type}) through ${this.constructor.name}`);

        if (type == "Event"
         || type == "OnDemandEvent"
         || type == "ScheduledSession"
         || type == "CourseInstanceSubEvent"){
            // The top level event is the Event

            this.doCleanup();

            if (typeof this.rawData.superEvent == 'object'){
                // It has a superEvent which we can get more data from.
                let {superEvent, ...event} = this.rawData;
                let normalisedEventData = {
                    ...superEvent,
                    ...event
                }
                // Get rid of stray 'type' property
                delete normalisedEventData.type;

                // If the parent is a CourseInstance, the child might have Event
                // type but we actually want to force this to be a
                // CourseInstanceSubEvent
                let superType = this.getType(superEvent);
                if(superType == "CourseInstance"){
                    normalisedEventData["@type"] = "CourseInstanceSubEvent";
                }

                let normalisedEvent = new NormalisedEvent(normalisedEventData, kind);
                this.normalisedEvents.push(normalisedEvent);
            }else{
                // No superEvent, just use all data from the Event
                let normalisedEvent = new NormalisedEvent(this.rawData, kind);
                this.normalisedEvents.push(normalisedEvent);
            }

        }
        else if (typeof this.rawData.subEvent == 'object'){
            // There are subEvents. If any are Event type, we normalise them.
            // This is expected to catch EventSeries and HeadlineEvent
            // TODO: if an Event has subEvents do we throw away the parent?
            //       in the same way we do for other types?

            let eventSubEvents = false;
            let subEvents = Utils.ensureArray(this.rawData.subEvent);

            for (let subEvent of subEvents){
                let type = this.getType(subEvent);
                if(type == "Event"
                || type == "OnDemandEvent"
                || type == "ScheduledSession"
                || type == "CourseInstanceSubEvent"){
                    // We only want to continue processing if any of the subEvents
                    // are the right type
                    eventSubEvents = true;
                    break;
                }
            }

            if (eventSubEvents){
                this.doCleanup();
                let {subEvent, ...parentEvent} = this.rawData;

                // Combine parent event data with each subEvent to make NormalisedEvents
                // Any properties that are on both the subEvent and the parent will take the
                // value from the subEvent
                for (let sub of subEvent){
                    let normalisedEventData = {
                        ...parentEvent,
                        ...sub
                    }

                    // Make sure the type value is set correctly
                    delete normalisedEventData.type;
                    if (type == "SessionSeries"){
                        normalisedEventData["@type"] = "ScheduledSession";
                    }else if(type == "CourseInstance"){
                        normalisedEventData["@type"] = "CourseInstanceSubEvent";
                    }else{
                        // Event or OnDemandEvent
                        normalisedEventData["@type"] = type;
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