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
        let errors = [];
        console.log(`Running ${id} (${type}) through ${this.constructor.name}`);

        if (type == "Event"
         || type == "OnDemandEvent"
         || type == "ScheduledSession"
         || type == "CourseInstanceSubEvent"){
            // The top level event is the Event

            this.doCleanup();

            if(this.rawData.superEvent != undefined){
                // It has a superEvent which we can get more data from.
                let {superEvent, ...event} = this.rawData;
                let superEventId;
                let normalisedEventData;

                if (typeof superEvent == 'object' && !Array.isArray(superEvent)){
                    // superEvent is embedded
                    normalisedEventData = {
                        ...superEvent,
                        ...event
                    }
                }else if(typeof superEvent == 'string' && superEvent.includes('http')){
                    // superEvent is referenced by a HTTP URI
                    // There's no point in even trying to look it up if it's not because
                    // we only store ones that are
                    let superEventResult = this.selectRawByDataId(superEvent);
                    let superEventData = superEventResult.data;
                    superEventId = superEventResult.id;
                    if (superEventData != undefined){

                        // unset superEvent ids in case they are not overriden by event
                        delete superEventData.id;
                        delete superEventData.identifier;
                        delete superEventData["@id"];
                        // also drop any circular subEvent, assuming it's a dup of event
                        delete superEventData.subEvent;
                        // some superEvents *also* have an eventSchedule, which we can also drop
                        delete superEventData.eventSchedule;

                        // merge arrays that we want to keep both from, rather than override
                        if(superEventData.activity != undefined && event.activity != undefined){
                            event.activity = [...superEventData.activity, ...event.activity];
                        }
                        if(superEventData.category != undefined && event.category != undefined){
                            event.category = [...superEventData.category, ...event.category];
                        }

                        normalisedEventData = {
                            ...superEventData,
                            ...event
                        }
                    }else{
                        errors.push({missingSuperEvent: `No raw_data with data_id [${superEvent}]`});
                        normalisedEventData = event;
                    }
                }else{
                    // superEvent is something else that we can't process..
                    // probably a bug
                    errors.push({invalidSuperEvent: `Can't process superEvent value [${superEvent}]`});
                    normalisedEventData = event;
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

                let normalisedEvent = new NormalisedEvent(normalisedEventData, kind, superEventId, errors);
                this.normalisedEvents.push(normalisedEvent);

            }else{
                // No superEvent, just use all data from the Event
                let normalisedEvent = new NormalisedEvent(this.rawData, kind, undefined, errors);
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

                    let normalisedEvent = new NormalisedEvent(normalisedEventData, kind, undefined, errors);
                    this.normalisedEvents.push(normalisedEvent);
                }
            }
        }

        resolve(this.normalisedEvents);
    });
  }

}

export default NormaliseEventPipe;