import path from 'path';
import Utils from "../utils.js";

class Pipe {
  constructor(rawData, normalisedEvents) {
    this.rawData = rawData;
    this.normalisedEvents = normalisedEvents;
    this.context = this.get_context();
  }

  /* Override this function */
  run(){
    return new Promise(async resolve => {
      log(`Running ${this.augmentedActivity.id} - ${this.augmentedActivity.data.name} through ${this.constructor.name}`);
      /* Do stuff to the raw data here */
      resolve(this.normalisedEvents);
    });
  }

  async get_context(){
    return await Utils.readJson(path.resolve(path.resolve(), './src/lib/oa.jsonld'));
  }

  find_invalid_properties(){
    // Properties that are not defined in the specification, and do not have the
    // data: prefix, should be wrapped in an 'invalidAttribute` object.
    //
    // Properties that have values such as empty strings, null, or empty arrays,
    // should be stripped from the normalised object, in accordance with the
    // Opportunity specification.
    //
    // but beta is okay
    // what about if there are additional contexts?
  }

}

export default Pipe
