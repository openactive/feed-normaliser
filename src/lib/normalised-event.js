import hash from 'object-hash';

/** This is used in making normalised events, and holds information on a normalised event.
Pipelines can create any number of these as they process data.
**/
class NormalisedEvent {
  constructor(data) {
    this.data = data;
  }

  id(){
    return hash(this.data)
  }

}

export default NormalisedEvent;
