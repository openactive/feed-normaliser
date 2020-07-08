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
    this.fixContext();
    this.fixInvalidData();
    this.expandObjects();
    this.addProvenanceInformation();
  }

  fixContext(){
    // Uses some heuristics to fix the @context value if it is wrong.
    // If the .jsonld URLs are used for the OA or beta contexts, changes them to the
    // official namespace.
    // If the OA context is not first, moves it first.
    // If the OA context is missing, adds it.
    // If there is no @context at all, creates it.
    // TODO: catch excessive wwws in context URL

    let contexts = [];
    if(this.rawData["@context"] === 'undefined'){
        this.rawData["@context"] = Settings.contextUrl;
    }else
    if(typeof this.rawData["@context"] === 'string'){
      // there's only one context
      if(this.rawData["@context"] !== Settings.contextUrl){
        // but it's not the OA one
        if(this.rawData["@context"] === Settings.contextJsonld){
          // if it's the .jsonld version of the OA just replace it with the right URL
          this.rawData["@context"] = Settings.contextUrl;
        }else{
          if(this.rawData["@context"] === Settings.betaContextJsonld){
            // Fix it if it's the beta one
            contexts.push(Settings.betaContextUrl);
          }else{
            // Then add to array with OA context
            contexts.push(this.rawData["@context"]);
          }
          contexts.unshift(Settings.contextUrl);
          this.rawData["@context"] = contexts;
        }
      }
    }else{
      // there are multiple contexts in an array
      this.rawData["@context"].forEach(function(context){
        if(context === Settings.contextJsonld){
          contexts.push(Settings.contextUrl);
        }else
        if(context === Settings.betaContextJsonld){
          contexts.push(Settings.betaContextUrl);
        }else{
          // Keep any custom contexts as-is
          contexts.push(context);
        }
      });
      if(!contexts.includes(Settings.contextUrl)){
        // OA context is missing altogether
        contexts.unshift(Settings.contextUrl);
      }else if(contexts[0] !== Settings.contextUrl){
        // OA context is there but not the first element
        let i = contexts.indexOf(Settings.contextUrl);
        contexts.splice(i, 1);
        contexts.unshift(Settings.contextUrl);
      }
      this.rawData["@context"] = contexts;
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
