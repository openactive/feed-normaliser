import path from 'path';
import Utils from "../utils.js";
import Settings from '../settings.js';
import { database_pool } from '../database.js';

class Pipe {
  constructor(rawData, normalisedEvents) {
    // rawMeta is an entire database row from the raw_data table, minus data field
    // rawData is the contents of the data field
    const { data, ...meta } = rawData;
    this.rawMeta = meta;
    if(data == null || data == undefined){
      this.rawData = {};
    }else{
      this.rawData = data;
    }
    this.normalisedEvents = normalisedEvents;
  }

  /* Override this function */
  async run(){
    throw ("Override this function");
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

  getId(event){
    if (typeof event === 'undefined'){
      event = this.rawData;
    }

    if(typeof event.id !== 'undefined'){
      return event.id;
    }else if( typeof event["@id"] !== 'undefined'){
      return event["@id"];
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
    this.expandObjects();
  }

  fixId(){
    this.rawData = this.fixIdInData(this.rawData);
  }

  fixIdInData(data){
    let dataJson = JSON.stringify(data);
    dataJson = dataJson.replace(/\"id\":/gm, '"@id":');
    return JSON.parse(dataJson);
  }

  fixType(){
    this.rawData = this.fixTypeInData(this.rawData);
  }

  fixTypeInData(data){
    let dataJson = JSON.stringify(data);
    dataJson = dataJson.replace(/\"type\":/gm, '"@type":');
    return JSON.parse(dataJson);
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
    if(activity !== 'undefined'){
      if(typeof activity === 'string'){
        activity = {
          "@type": "Concept",
          "prefLabel": activity
        }
      }else if(typeof activity === 'object' && !Array.isArray(activity)){
        if(activity.type != undefined){
          activity["@type"] = activity.type;
          delete activity.type;
        }
        if(activity["@type"] == undefined){
          activity["@type"] = "Concept";
        }
      }
    }
    return activity;
  }

  async selectRawByDataId(dataId){
    // data_id is a URI from the data object
    // eg. the value of id or @id if present and valid
    const client = await database_pool.connect();
    let result;
    try{
      const rawDataResult = await client.query('SELECT id, data FROM raw_data WHERE data_id=$1 LIMIT 1', [dataId]);
      result = rawDataResult["rows"][0];
    }catch(error){
      console.log(`Error querying for ${dataId}`);
      console.log(error);
    }finally{
      await client.release();
    }

    return result; // undefined if no results
  }


}

export default Pipe
