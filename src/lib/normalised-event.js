import hash from 'object-hash';

/** This is used in making normalised events, and holds information on a normalised event.
Pipelines can create any number of these as they process data.
**/
class NormalisedEvent {
  constructor(data, kind, parentId) {
    this.data = data;
    // Is it always possible to extract Kind from data?
    // For now, to be very robust, require the pipe that creates this to set Kind too.
    this.kind = kind;
    // parentId:
    // * should be the database id, NOT the id from the actual data
    // * is not required
    this.parentId = parentId;
  }

  id(){
    return hash(this.data)
  }

}

export default NormalisedEvent;
