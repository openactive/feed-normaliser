import path from 'path';
import Utils from "../utils.js";
import Settings from '../settings.js';

class Pipe {
  constructor(rawData, normalisedEvents) {
    // rawMeta is an entire database row from the raw_data table, minus data field
    // rawData is the contents of the data field
    const { data, ...meta } = rawData;
    this.rawMeta = meta;
    this.rawData = data;
    this.provenance = {};
    this.normalisedEvents = normalisedEvents;
    this.context = Utils.getContext();
  }

  /* Override this function */
  run(){
    return new Promise(async resolve => {
      log(`Running pipe ${this.constructor.name}`);
      /* Do stuff to the raw data here */
      resolve(this.normalisedEvents);
    });
  }

  getType(event){
    if (typeof event === 'undefined'){
      event = this.rawData;
    }
    if(typeof event.type !== 'undefined'){
      return event.type;
    }else if( typeof event["@type"] !== 'undefined'){
      return event["@type"];
    }else{
      return null;
    }
  }

  getKind(){
    return this.rawMeta.data_kind;
  }

  doCleanup(){
    this.fixContext();
    this.fixId();
    this.fixType();
    this.fixInvalidData();
    this.expandObjects();
    this.addProvenanceInformation();
  }

  fixId(){
    if(typeof this.rawData.id === 'undefined' && typeof this.rawData["@id"] !== 'undefined'){
      this.rawData.id = this.rawData["@id"];
      delete this.rawData["@id"];
    }
  }

  fixType(){
    // TODO what if type is an array
    if(typeof this.rawData.type === 'undefined' && typeof this.rawData["@type"] !== 'undefined'){
      this.rawData.type = this.rawData["@type"];
      delete this.rawData["@type"];
    }
  }

  fixContext(){
    // Uses some heuristics to fix the @context value if it is wrong.
    // If the .jsonld URLs are used for the OA or beta contexts, changes them to the
    // official namespace.
    // If the OA context is not first, moves it first.
    // If the OA context is missing, adds it.
    // If there is no @context at all, creates it.
    // Always returns an array.
    // TODO: catch excessive wwws in context URL

    let contexts = [];
    if(typeof this.rawData["@context"] !== 'undefined'){
      // Make sure @context value is an array
      this.rawData["@context"] = Utils.ensureArray(this.rawData["@context"]);

      this.rawData["@context"].forEach(function(context){
        if(context == Settings.contextJsonld){
          // Wrong URL for right context, correct it
          contexts.push(Settings.contextUrl);
        }else
        if(context == Settings.betaContextJsonld){
          // Wrong URL for beta context, correct it
          contexts.push(Settings.betaContextUrl);
        }else{
          // Keep any custom contexts as-is
          contexts.push(context);
        }
      });
      if(!contexts.includes(Settings.contextUrl)){
        // OA context is missing altogether
        //   Stick it on the beginning
        contexts.unshift(Settings.contextUrl);
      }else if(contexts[0] !== Settings.contextUrl){
        // OA context is there but not the first element
        //   Move it to start
        let i = contexts.indexOf(Settings.contextUrl);
        contexts.splice(i, 1);
        contexts.unshift(Settings.contextUrl);
      }
      this.rawData["@context"] = contexts;

    }else{
      // No context, set it
      this.rawData["@context"] = [Settings.contextUrl];
    }

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

    if(typeof organizer !== 'undefined'){
      organizer = this.expandLogo(organizer);
      event.organizer = organizer;
    }
    // programme
    if(typeof programme !== 'undefined'){
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
    if(typeof activity !== 'undefined'){
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

    // TODO: get provenance information from database
    this.rawData["provenanceInformation"] = {
      "feedUrl": [],
      "publisherName": ""
    }
  }


}

export default Pipe
