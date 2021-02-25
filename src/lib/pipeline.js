
class PipeLine {
  constructor(rawData, pipes) {
    this.rawData = rawData;
    this.pipes = pipes;
  }

  async run() {
    let normalisedEvents = [];
    let errors = [];
    for (const Pipe of this.pipes) {
      let pipeSection;
      try {
        pipeSection = new Pipe(this.rawData, normalisedEvents);
        normalisedEvents = await pipeSection.run();
        // TODO let the pipeline pass errors back, add them to errors
      } catch (error) {
        console.log(`Error running data through pipe ${pipeSection.constructor.name} \n ${error}`);
        errors.push({ 'error':error, 'pipe':pipeSection.constructor.name});
      }
    }

    return { rawDataId: this.rawData.id, normalisedEvents: normalisedEvents, errors: errors};
  }

}

export default PipeLine;