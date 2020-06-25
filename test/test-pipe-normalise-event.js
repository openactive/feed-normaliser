import assert from 'assert';
import path from 'path';
import Utils from '../src/lib/utils.js';
import NormaliseEventPipe from '../src/lib/pipes/normalise-event-pipe.js';


/**
 * It may seem silly to have tests for a test bit of code.
 * But the point is to illustrate how to test pipes.
 * Other people writing pipes should have a look.
 ***/

describe('normalise-event', function() {
    it('should return a normalised Event object', async function(done) {

        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-not-normalised.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));

        let pipe = new NormaliseEventPipe({id: 67, data: input}, []);
        let results_promise = pipe.run();

        results_promise.then((results)=> {

          assert.equal(results.length,1);
          assert.equal(results[0].kind, 'Event');
          assert.deepEqual(results[0].data, output);

        })
        .then(() => done(), done)
        .catch((error) => {
            done(error);
        });
    });
});
