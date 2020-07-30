import Pipe from './pipe.js';
import { cache, Utils } from '../utils.js';
import NormalisedEvent from '../normalised-event.js';

/**
Adds more activities to NormalisedEvents based on the
hierarchy of activities in the OA Activity List as well
as string matching in names and descriptions.
**/
class ActivitiesPipe extends Pipe {
  run(){
    return new Promise(async resolve => {

      await this.updateActivitiesCache();

      // Loop through the normalisedEvents
      for(let idx in this.normalisedEvents) {

      }

      resolve(this.normalisedEvents);
    });
  }

  async updateActivitiesCache(){
    // Load the Activity List if not already cached
    if(Object.keys(cache.activities).length == 0){
      try{
        await Utils.loadActivitiesJSONIntoCache();
      }catch(e){
        console.log(`ActivitiesPipe couldn't update cache\n${e}`);
      }
    }
  }

  /**
  Most activities in the ActivityList only have a prefLabel but some have
  altLabel so we should get this too.
  **/
  getActivityLabels(activityKey){
    let labels = [];
    let activityList = cache.activities;
      // Get the labels from the cached ActivityList
      labels.push(activityList[activityKey]['prefLabel']);
      if (activityList[activityKey]['altLabel'] !== undefined){
        activityList[activityKey]['altLabel'].forEach(function(altLabel){
          labels.push(altLabel);
        });
      }
    return labels;
  }

  /**
  Recursively checks activities in the ActivityList for broader field
  and returns all labels of broader concepts. The broader field is an
  array of ids that can also be found in the ActivityList.
  **/
  getBroaderActivities(activityKeys, activitiesSoFar = []){
    let activityList = cache.activities;

    if (!Array.isArray(activityKeys)){
      activityKeys = [activityKeys];
    }

    for (let activityKey of activityKeys){

      let broaderKeys = activityList[activityKey]['broader'];
      if (broaderKeys !== undefined){
        let broaderLabels = [];
        for (let broaderKey of broaderKeys){
          let broaderLabel = this.getActivityLabels(this.normaliseActivityId(broaderKey));
          broaderLabels = broaderLabels.concat(broaderLabel);
          console.log(`ActivitiesPipe found broader activity: [${broaderLabel}]`);
        }
        activitiesSoFar = activitiesSoFar.concat(broaderLabels);
        return this.getBroaderActivities(broaderKeys, activitiesSoFar);
      }

    }

    return activitiesSoFar;
  }

  /**
  Simple string in string matching, only matches complete words,
  which helps to avoid false positives from substrings.
  **/
  searchTextForActivity(text, activity){
    const regex = new RegExp("\\b"+activity+"\\b");
    let result = text.search(regex) !== -1;
    // if (result){
    //   this.log(`Found [${activity}] in "${text}"`);
    // }
    return result;
  }

  /**
  In the ActivityList ids take the form https://openactive.io/activity-list#{id}
  but some data uses http, www, and/or a forward slash before the #{id}. So let's strip these out.
  **/
  normaliseActivityId(activityId){
    let normed = activityId.replace("http://", "https://").replace("www.", "").replace("/#", "#");
    return normed;
  }
}


export default ActivitiesPipe;