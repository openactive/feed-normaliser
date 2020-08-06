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

      console.log(`Running ${this.normalisedEvents.length} normalised events through ${this.constructor.name}`);

      await this.updateActivitiesCache();

      // Loop through the normalisedEvents
      for(let idx in this.normalisedEvents) {

        // IDs from the OA activityList of activities to add
        let activityIds = new Set();

        // Activities we can't improve we should keep
        // and add them back later
        let unchangedActivities = [];

        if(Array.isArray(this.normalisedEvents[idx].data.activity)){

          // For each value in `activity`
          for(let activity of this.normalisedEvents[idx].data.activity){

            if(activity != undefined){
              // If no inScheme, assume we want the main OA codelist
              if(activity.inScheme == undefined || activity.inScheme == "https://openactive.io/activity-list"){

                let id = this.getActivityId(activity);
                if(id == undefined){
                  // It is common for data not to have an id
                  // Look through labels and add IDs from cache instead
                  if(activity.prefLabel in cache.activities.byLabel){
                    activityIds.add(cache.activities.byLabel[activity.prefLabel].id);
                  }else{
                    unchangedActivities.push(activity);
                  }
                }else{
                  // Check ID is in cache
                  if(id in cache.activities.byId){
                    activityIds.add(id);
                  }else{
                    unchangedActivities.push(activity);
                  }
                }
              }else{
                unchangedActivities.push(activity);
              }
            }
          }
        }

        // Add broader activities for all from OA ActivityList
        let moreActivities = [];
        moreActivities = this.getBroaderActivities([...activityIds]);

        // Get more activities from cache using name and description
        moreActivities = moreActivities.concat(this.extractActivities(this.normalisedEvents[idx]));

        for(let a of moreActivities){
          activityIds.add(a.id);
        }

        // Add any new activities back to the normalised event
        if(unchangedActivities.length > 0 || activityIds.size > 0){
          this.normalisedEvents[idx].data.activity = unchangedActivities;

          for(let id of activityIds){
            let outputActivity = {
              "@id": id,
              "@type": "Concept",
              "prefLabel": cache.activities.byId[id].prefLabel,
              "inScheme": "https://openactive.io/activity-list"
            }
            this.normalisedEvents[idx].data.activity.push(outputActivity);
          }
        }
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

  getActivityId(activityObject){
    if(activityObject.id != undefined){
      return this.normaliseActivityId(activityObject.id);
    }
    if(activityObject["@id"] != undefined){
      return this.normaliseActivityId(activityObject["@id"]);
    }
  }

  /**
  Check for labels from the ActivityList in the name and description
  fields of the event, and apply these activities if found.
  **/
  extractActivities(normalisedEvent){
    let activityList = cache.activities.byId;
    let additionalActivities = [];
    let searchFields = ['name', 'description'];

    for (const id in activityList) {

      for (const field of searchFields){

        if (normalisedEvent.data[field] !== undefined){
          if(this.searchTextForActivity(normalisedEvent.data[field].toLowerCase(), activityList[id].prefLabel.toLowerCase())){
            additionalActivities.push(activityList[id]);
            additionalActivities = additionalActivities.concat(this.getBroaderActivities(id));
          }

          if (activityList[id].altLabel !== undefined){
            for (const altLabel in activityList[id].altLabel){
              if(this.searchTextForActivity(normalisedEvent.data[field].toLowerCase(), altLabel.toLowerCase())){
                additionalActivities.push(activityList[id]);
                additionalActivities = additionalActivities.concat(this.getBroaderActivities(id));
              }

            }
          }
        }
      }

    }

    return additionalActivities;
  }

  /**
  Given an ID, get the corresponding labels from the cache.
  Most activities in the ActivityList only have a prefLabel but some have
  altLabel so we should get this too.
  **/
  getActivityLabels(activityKey){
    let labels = [];
    let activityList = cache.activities.byId;
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
  Given a label, get the corresponding activity from the cache.
  **/
  getIdByLabel(activityLabel){
    return cache.activities.byLabel[activityLabel];
  }

  /**
  Recursively checks activities in the ActivityList for broader field
  and returns all broader concepts. The broader field is an
  array of ids that can also be found in the ActivityList.
  **/
  getBroaderActivities(activityKeys, activitiesSoFar = []){
    let activityList = cache.activities.byId;

    if (!Array.isArray(activityKeys)){
      activityKeys = [activityKeys];
    }

    for (let activityKey of activityKeys){

      activityKey = this.normaliseActivityId(activityKey);
      let broaderKeys = activityList[activityKey]['broader'];

      if (broaderKeys !== undefined){
        for (let broaderKey of broaderKeys){
          activitiesSoFar.push(activityList[broaderKey]);
        }
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