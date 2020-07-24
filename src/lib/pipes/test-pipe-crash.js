import Pipe from './pipe.js';

class TestPipeCrash extends Pipe {
  run(){
    throw 'AGGGH';
  }
}

export default TestPipeCrash;