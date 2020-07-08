import path from 'path';
import Utils from "../utils.js";
import Settings from '../settings.js';

class Pipe {
  constructor(rawData, normalisedEvents) {
    this.rawData = rawData.data;
    this.rawMeta = rawData;
    delete this.rawMeta["data"]; // meta is everything except data
    this.normalisedEvents = normalisedEvents;
    this.context = Utils.getContext();
  }

  /* Override this function */
  run(){
    return new Promise(async resolve => {
      log(`Running ${this.augmentedActivity.id} - ${this.augmentedActivity.data.name} through ${this.constructor.name}`);
      /* Do stuff to the raw data here */
      resolve(this.normalisedEvents);
    });
  }

  doCleanup(){
    this.fixInvalidData();
    this.expandObjects();
    this.addProvenanceInformation();
  }

  fixInvalidData(){
    let event = this.rawData;
    let invalidProperties = this.findInvalidProperties();
    let emptyValues = this.findEmptyValues();
    // TODO: fix them
    this.rawData = event;
  }

  expandObjects(){
    let event = this.rawData;
    let organizer = event.organizer;
    let programme = event.programme;
    let activity = event.activity;

    if(organizer !== 'undefined'){
      organizer = this.expandLogo(organizer);
      event.organizer = organizer;
    }
    // programme
    if(programme !== 'undefined'){
      if(typeof programme === 'string'){
        programme = {
          "@type": "Brand",
          "name": programme
        }
      }
      programme = this.expandLogo(programme);
      event.programme = programme;
    }

    // activity
    if(activity !== 'undefined'){
      let activities = [];
      if(Array.isArray(activity)){
        for(let anActivity of activity){
          activities.push(this.expandActivity(anActivity));
        }
      }else if(typeof activity === 'string'){
        activities.push(this.expandActivity(activity));
      }
      event.activity = activities;
    }

    this.rawData = event;
  }

  expandLogo(objectWithLogo){
    if(objectWithLogo.logo !== 'undefined' && typeof objectWithLogo.logo === 'string'){
      let logo = {
        "@type": "ImageObject",
        "url": objectWithLogo.logo
      }
      objectWithLogo.logo = logo;
    }
    return objectWithLogo;
  }

  expandActivity(activity){
    if(activity !== 'undefined' && typeof activity === 'string'){
      activity = {
        "@type": "Concept",
        "prefLabel": activity
      }
    }
    return activity;
  }

  findInvalidProperties(){
    // Properties that are not defined in the specification, and do not have the
    // data: prefix, should be wrapped in an 'invalidAttribute` object.
    //
    // but beta is okay
    // what about if there are additional contexts?
    //
    // Get validation results from db or execute validation if not present
    //
    // import validator from '@openactive/data-model-validator';
    // import Settings from '../src/lib/settings.js';
    //
    // const validate_options = {
    //     loadRemoteJson: true,
    //     remoteJsonCachePath: Settings.dataModelValidatorRemoteJsonCachePath,
    // };

    // const result = await validator.validate(input.data, validate_options);
    // console.log(result.filter(r => r.type === "field_not_in_spec"));
  }

  findEmptyValues(){
    // Properties that have values such as empty strings, null, or empty arrays,
    // should be stripped from the normalised object, in accordance with the
    // Opportunity specification.
    //
    // console.log(result.filter(r => r.type === "field_is_empty"));
  }

  addProvenanceInformation(){
    // "provenanceInformation": {
    //   "feedUrl" : [
    //     "https://playwaze.com/OpenData/ScheduledSessions",
    //     "https://playwaze.com/OpenData/SessionSeries"
    // ],
    // "publisherName": "Playwaze",
    // "parentId": ["https://playwaze.com/SessionSeries/jifgh8dinma",
    //              "https://playwaze.com/SessionSeries/jifgh8dinma/ScheduledSession/bzncxfzk8oe"]
    // },
    this.rawMeta["provenanceInformation"] = {
      "feedUrl": [],
      "publisherName": "",
      "parentId": []
    }
  }

}

export default Pipe
