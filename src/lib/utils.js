import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import Settings from './settings.js';


class Utils {

  static async sleep(tag, timeSeconds){
    for (let i=0; i != timeSeconds; i++){
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  static makeNextURL(startURL, nextURL) {
    if (nextURL.substring(0,1) == 'h') {
      // An absolute URL
      return nextURL;
    }

    if (nextURL.substring(0,1) == '/') {
      // An relative URL
      return (new URL(nextURL, startURL)).href;
    }

    throw new Error(`makeNextURL is stuck. ${startURL} ${nextURL}`);

  }

  static async readJson(path) {
    try {
      return JSON.parse(
        await fs.readFile(path, {encoding: 'utf8'})
      );
    } catch (error){
        console.error(error);
    }
  }

  static async getContext(){
    return await Utils.readJson(path.resolve(path.resolve(), './src/lib/oa.jsonld'));
  }

  static getIdFromData(data){
    // Gets the id from a data object, only if it's a valid URI
    if(data != undefined){
      let id;
      if(data["@id"] != undefined){
        id = data["@id"];
      }else if(data.id != undefined){
        id = data.id;
      }
      if(typeof id === 'string' && id.includes('http')){
        return id;
      }
    }
  }

  static ensureArray(input){
    // if input is an array, returns it directly
    // otherwise puts input into an array and returns that
    if (!Array.isArray(input)){
        return [input];
    }else{
        return input;
    }
  }

  static async loadActivitiesJSONIntoCache() {

    const res = await fetch(Settings.activityListJSONLD);
    // TODO handle errors / non 200 responses
    const activitiesData =  await res.json();

    cache.activities = {};

    for(let idx in activitiesData.concept) {
      cache.activities[activitiesData.concept[idx].id] = activitiesData.concept[idx];
    }

  }

}

var cache = { postcodes: {}, activities: {} };

export {
  cache,
  Utils,
};

export default Utils;