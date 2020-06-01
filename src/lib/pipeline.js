
class PipeLine {
  constructor(rawData, pipes, pipeOutputCb) {
    this.rawData = rawData;
    this.pipes = pipes;
    this.pipeOutputCb = pipeOutputCb;
  }

  run() {
    return new Promise(async resolve => {
      let normalisedEvents = [];
      for (const Pipe of this.pipes) {
        try {
          const pipeSection = new Pipe(this.rawData, normalisedEvents);
          normalisedEvents = await pipeSection.run();
        } catch (error) {
          console.log(`Error running data through pipe ${pipeSection.constructor.name} \n ${error}`);
        }
      }
      if (normalisedEvents) {
        await this.pipeOutputCb( this.rawData.id, normalisedEvents,);
      }

      resolve("All pipes run");
    });
  }

}

export default PipeLine;