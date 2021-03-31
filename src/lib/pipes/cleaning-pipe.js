import validator from '@openactive/data-model-validator';
import lodash from 'lodash';
import Settings from '../settings.js';
import NormalisedEvent from '../normalised-event.js';
import Pipe from './pipe.js';

/**
The CleaningPipe operates over all normalisedEvents.
It should be run after the normalisation pipes and before the data enhancement pipes.
This pipe uses the openactive data model validator to strip out:
 - fields with empty or null values
 - fields that are not defined in the OA Modelling Spec (besides beta:)
   - these are moved to an `invalidAttribute` property at the top level
**/
class CleaningPipe extends Pipe {
  async run(){
    console.log(`Running ${this.normalisedEvents.length} normalised events through ${this.constructor.name}`);
    for(let idx in this.normalisedEvents){
      const fixedData = await this.fixInvalidData(this.normalisedEvents[idx].data);
      this.normalisedEvents[idx].data = fixedData;
    }

    return this.normalisedEvents;
  }

  async fixInvalidData(normalisedEventData){
    let fixedEventData = {...normalisedEventData};

    // Find invalid data
    const result = await this.validate(normalisedEventData);
    const invalidProperties = this.findInvalidProperties(result);
    const emptyValues = this.findEmptyValues(result);

    // Fix invalid data
    if(invalidProperties.length > 0){
      fixedEventData.invalidAttribute = {};
    }
    for(let i in invalidProperties){
      // Use the JSONPath notation from the validator to navigate the object
      // TODO: better to make invalidAttribute a list of {path: ..., value: ...} objects?
      let path = invalidProperties[i].path.replace('$.','');
      let value = invalidProperties[i].value;
      lodash.set(fixedEventData.invalidAttribute, path, value);
      lodash.unset(fixedEventData, path);
    }
    for(let j in emptyValues){
      let path = emptyValues[j].path.replace('$.','');
      lodash.unset(fixedEventData, path);
    }
    // We have to do another pass because if there was an object with all empty values
    // these values got picked up by the validator and have now been removed but the
    // object itself did not leaving an empty object {} behind
    for (let k in fixedEventData){
      if(typeof fixedEventData[k] === 'object' && Object.keys(fixedEventData[k]).length === 0){
        lodash.unset(fixedEventData, k);
      }
    }
    return fixedEventData;
  }

  findInvalidProperties(validationResult){
    // Properties that are not defined in the specification, and do not have the
    // beta: prefix, should be wrapped in an 'invalidAttribute` object.
    return (validationResult.filter(r => r.type === "field_not_in_spec"));
  }

  findEmptyValues(validationResult){
    // Properties that have values such as empty strings, null, or empty arrays,
    // should be stripped from the normalised object, in accordance with the
    // Opportunity specification.
    return validationResult.filter(r => r.type === "field_is_empty");
  }

  async validate(normalisedEventData){
    const validate_options = {
        loadRemoteJson: true,
        remoteJsonCachePath: Settings.dataModelValidatorRemoteJsonCachePath,
    };

    const result = await validator.validate(normalisedEventData, validate_options);
    return result;
  }
}

export default CleaningPipe;