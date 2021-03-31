import Pipe from './pipe.js';
import { cache, Utils } from '../utils.js';
import fetch from 'node-fetch';
import Settings from '../settings.js';

/*
The GeoPipe adds more location data given a postcode:
  - coordinates in a `geo` object
  - locality
  - region
  - country
*/
class GeoPipe extends Pipe {
  async run(){

    for(let idx in this.normalisedEvents) {

      let postcode = this.getPostcode(this.normalisedEvents[idx].data.location);
      if (postcode != undefined) {

        let postcodeData;

        if (!cache.postcodes[postcode]){
          let lookupError = await this.lookupPostcode(postcode);

          if(lookupError != undefined){
            // error with lookup
            if(this.normalisedEvents[idx].errors == undefined){
              this.normalisedEvents[idx].errors = [];
            }
            this.normalisedEvents[idx].errors.push(lookupError);
          } else {
            postcodeData = cache.postcodes[postcode];
          }
        } else {
          console.log(`Geopipe getting [${postcode}] from cache`);
          postcodeData = cache.postcodes[postcode];
        }

        if(postcodeData != undefined){
          this.addLocationData(this.normalisedEvents[idx], postcodeData);
        }

      }
    }

    return this.normalisedEvents;
  }

  getPostcode(location){
    if(location != undefined && location.hasOwnProperty("address") && location.address.hasOwnProperty("postalCode")){
      return location.address.postalCode;
    }

    return undefined;
  }

  async lookupPostcode(postcode){
    /*
    Gets more geo data from postcode lookup service and
    saves it in the postcode cache.
    Returns undefined on success or error object on failure.
    */
    console.log(`Geopipe looking up [${postcode}]`);

    try {
      let url = 'https://postcodes.io/postcodes/' + postcode;
      const res = await fetch(url);
      const postcodeResult = await res.json();

      if (postcodeResult.status == 200) {

        console.log(`Geopipe found [${postcode}]`);

        cache.postcodes[postcode] = {
          "coordinates": [postcodeResult.result.longitude,postcodeResult.result.latitude],
          "locality": postcodeResult.result.admin_district,
          "region": postcodeResult.result.region,
          "country": postcodeResult.result.country
        };

        return;

      }else{
        return { postcodeLookupFailed: `Geopipe could not look up postcode [${postcode}]\nStatus code: ${postcodeResult.status}\nResponse:\n${postcodeResult}`}
      }

    } catch (e) {
      console.log(e);
      return { missingPostcode: `Geopipe could not get postcode [${postcode}] Error: \n ${e}` };
    }
  }

  addLocationData(normalisedEvent, postcodeData){

    // Add data to `address` field if not set
    if(!normalisedEvent.data.location.address.addressLocality){
      normalisedEvent.data.location.address.addressLocality = postcodeData.locality
    }
    if(!normalisedEvent.data.location.address.addressRegion){
      normalisedEvent.data.location.address.addressRegion = postcodeData.region
    }
  if(!normalisedEvent.data.location.address.addressCountry){
      normalisedEvent.data.location.address.addressCountry = postcodeData.country
    }
    // Add data to `geo` field if not set
    if(!normalisedEvent.data.location.geo){
      normalisedEvent.data.location.geo = {
        "@type": "GeoCoordinates",
        "longitude": postcodeData.coordinates[0],
        "latitude": postcodeData.coordinates[1]
      }
    }

  }
}

export default GeoPipe;