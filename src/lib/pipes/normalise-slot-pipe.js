import Pipe from './pipe.js';
import Utils from '../utils.js';
import NormalisedEvent from '../normalised-event.js';

// Normalises an opportunity data object with the following types:
//  * FacilityUse
//  * IndividualFacilityUse
//  * Slot
class NormaliseSlotPipe extends Pipe {
  async run() {
    let id = this.getId();
    let type = this.getType();
    let kind = this.getKind();
    let parentId;
    let errors = [];
    console.log(`Running ${id} (${type}) through ${this.constructor.name}`);
    // console.log(this.rawData);
    if (type == "FacilityUse"
      || type == "IndividualFacilityUse") {
      // The top level event is the [Individual]FacilityUse

      this.doCleanup();

      if (typeof this.rawData.aggregateFacilityUse == 'object') {
        // It has a parent FacilityUse which we can get more data from
        let updatedParent = this.combineIfuWithParent(this.rawData);
        this.combineSlotAndParent(updatedParent);

      } else
        if (typeof this.rawData.event == 'object') {
          // It has event property, which is where Slots live
          this.combineSlotAndParent(this.rawData);
        }

      if (typeof this.rawData.individualFacilityUse == 'object') {
        // It has individualFacilityUse (Slots can live on these)
        this.extractIndividualFacilityUse(this.rawData);
      }
    } else if (type == "Slot") {
      // The top level is an individual Slot
      // Which MUST link by reference to a FacilityUse
      let normalisedEventData;
      let parentId;

      this.doCleanup();

      let { facilityUse, ...slot } = this.rawData;
      if (typeof facilityUse == 'string' && facilityUse.includes("http")) {
        let facilityUseResult = this.selectRawByDataId(facilityUse);
        let facilityUseData = facilityUseResult.data;
        parentId = facilityUseResult.id;
        if (facilityUseData != undefined) {

          facilityUseData = this.fixIdInData(this.fixTypeInData(facilityUseData));

          // unset facilityUse ids in case they are not overriden by event
          delete facilityUseData.identifier;
          delete facilityUseData["@id"];
          // drop hoursAvailable because it doesn't make sense on Slot
          delete facilityUseData.hoursAvailable;
          // drop event because it contains Slots
          delete facilityUseData.event;

          // merge arrays that we want to keep both from, rather than override
          if (facilityUseData.activity != undefined && slot.activity != undefined) {
            slot.activity = [...facilityUseData.activity, ...slot.activity];
          }
          if (facilityUseData.category != undefined && slot.category != undefined) {
            slot.category = [...facilityUseData.category, ...slot.category];
          }
          if (facilityUseData.offers != undefined && slot.offers != undefined) {
            slot.offers = [...facilityUseData.offers, ...slot.offers];
          }

          // Merge contexts if FU has extra ones
          if (Array.isArray(facilityUseData["@context"])) {
            for (let context of facilityUseData["@context"]) {
              if (!slot["@context"].includes(context)) {
                slot["@context"].push(context);
              }
            }
          }

          normalisedEventData = {
            ...facilityUseData,
            ...slot
          };
        } else {
          normalisedEventData = slot;
          errors.push({ missingFacilityUse: `No raw_data with data_id [${facilityUse}]` });
        }
      } else {
        // facilityUse is invalid but we'll store the Slot data anyway
        normalisedEventData = slot;
        errors.push({ invalidFacilityUse: `Can't process facilityUse value [${facilityUse}]` });
      }

      let normalisedEvent = new NormalisedEvent(normalisedEventData, kind, parentId, errors);
      this.normalisedEvents.push(normalisedEvent);
    }

   return this.normalisedEvents;
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

        // Make sure the @type value is set correctly
        normalisedEventData["@type"] = "Slot";

        // Delete circular references to parents from Slots
        delete normalisedEventData.aggregateFacilityUse;
        delete normalisedEventData.individualFacilityUse;

        let normalisedEvent = new NormalisedEvent(normalisedEventData, kind);
        this.normalisedEvents.push(normalisedEvent);
    }
  }

  combineIfuWithParent(individualFacilityUse){
    let {aggregateFacilityUse, ...ifu} = individualFacilityUse;
    // Take all properties from the FacilityUse and apply them to the IFU
    // then override any duplicates with those from the IFU.
    // Any slots under 'event' property will be retained from either,
    // but if they're on both, only the IFU ones will be retained
    let updatedParent = {
        ...aggregateFacilityUse,
        ...ifu
    }
    delete updatedParent.aggregateFacilityUse;
    return updatedParent;
  }

  extractIndividualFacilityUse(facilityUse){
    let {individualFacilityUse, ...parentEvent} = facilityUse;
    individualFacilityUse = Utils.ensureArray(individualFacilityUse);
    // one FacilityUse can have many individualFacilityUse
    for (let ifu of individualFacilityUse){
        let baseEventData = {
            ...parentEvent,
            ...ifu
        }
        // one IndividualFacilityUse can have many Slots
        if(typeof ifu.event == 'object'){
            this.combineSlotAndParent(baseEventData);
        }
    }
  }

}

export default NormaliseSlotPipe;