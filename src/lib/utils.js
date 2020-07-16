import { promises as fs } from 'fs';
import path from 'path';


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

  static getIdFromData(data, feed_url){
    // Gets or generates a unique id from data.
    // data is the contents of the `data` field on an object in an RPDE feed
    // Returns `@id` if present; if not returns `id`.
    // If neither returns feed_url + `identifier`

    if(typeof data["@id"] !== 'undefined'){
      return data["@id"];
    }else if(typeof data.id !== 'undefined'){
      return data.id;
    }else if(typeof data.identifier !== 'undefined'){
      if(feed_url.slice(-1) != "/"){
        feed_url = feed_url + "/";
      }
      return feed_url + data.identifier;
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

}

export {
  Utils,
};

export default Utils;