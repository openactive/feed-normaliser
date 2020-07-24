
class PipeLine {
  constructor(rawData, pipes, pipeOutputCb) {
    this.rawData = rawData;
    this.pipes = pipes;
    this.pipeOutputCb = pipeOutputCb;
  }

  run() {
    return new Promise(async resolve => {
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

      await this.pipeOutputCb( this.rawData.id, normalisedEvents, errors);

      resolve("All pipes run");
    });
  }

}

export default PipeLine;