import Pipe from './pipe.js';
import Utils from '../utils.js';
import NormalisedEvent from '../normalised-event.js';

// Normalises an opportunity data object with the following types:
//  * Event
//  * OnDemandEvent
//  * SessionSeries
//  * ScheduledSession
class NormaliseSlotPipe extends Pipe {
  run(){

    return new Promise(async resolve => {

        let id = this.getId();
        let type = this.getType();
        let kind = this.getKind();
        console.log(`Running ${id} (${type}) through ${this.constructor.name}`);
        // console.log(this.rawData);
        if (type == "FacilityUse"
         || type == "IndividualFacilityUse"){
            // The top level event is the [Individual]FacilityUse

            this.doCleanup();

            if (typeof this.rawData.event !== 'undefined'){
                // It has event property, which is where Slots live
                this.combineSlotAndParent(this.rawData);
            }
            if (typeof this.rawData.aggregateFacilityUse !== 'undefined'){

            }
            if (typeof this.rawData.individualFacilityUse !== 'undefined'){
                // It has individualFacilityUse (Slots can live on these)
                this.combineIFUAndParent(this.rawData);
            }
        }

        resolve(this.normalisedEvents);
    });
  }

  combineSlotAndParent(slotAndParent){
    let kind = this.getKind();
    let {event, ...parentEvent} = slotAndParent;
    event = Utils.ensureArray(event);

    // Combine parent event data with each slot to make NormalisedEvents
    // Any properties that are on both the slot and the parent will take the
    // value from the slot
    for (let slot of event){
        let normalisedEventData = {
            ...parentEvent,
            ...slot
        }

        // Make sure @id value is set correctly
        let slotId = this.getId(normalisedEventData);
        normalisedEventData["@id"] = slotId;
        delete normalisedEventData.id;

        // Make sure the @type value is set correctly
        delete normalisedEventData.type;
        normalisedEventData["@type"] = "Slot";

        // Delete circular references to parents from Slots
        delete normalisedEventData.aggregateFacilityUse;
        delete normalisedEventData.individualFacilityUse;

        let normalisedEvent = new NormalisedEvent(normalisedEventData, kind);
        this.normalisedEvents.push(normalisedEvent);
    }
  }

  combineIFUAndParent(IFUAndParent){
    let {individualFacilityUse, ...parentEvent} = IFUAndParent;
    individualFacilityUse = Utils.ensureArray(individualFacilityUse);
    // one FacilityUse can have many individualFacilityUse
    for (let ifu of individualFacilityUse){
        let baseEventData = {
            ...parentEvent,
            ...ifu
        }
        // one IndividualFacilityUse can have many Slots
        if(typeof ifu.event !== 'undefined'){
            this.combineSlotAndParent(baseEventData);
        }
    }
  }

}

export default NormaliseSlotPipe;