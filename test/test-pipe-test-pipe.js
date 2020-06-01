import assert from 'assert';
import TestPipe from '../src/lib/pipes/test-pipe.js';


/**
 * It may seem silly to have tests for a test bit of code.
 * But the point is to illustrate how to test pipes.
 * Other people writing pipes should have a look.
 ***/

describe('test-pipe', function() {
    describe('basic test', function() {

        let pipe = new TestPipe({id: 67, data: {"test":true }}, []);
        let results_promise = pipe.run();
        results_promise.then((results)=> {

            it('should have 2 results', function() {
              assert.equal(results.length,2);
            });

            it('check result 1', function() {
              assert.deepEqual(results[0].data,{ test: 1, data: { test: true } });
            });

            it('check result 2', function() {
              assert.deepEqual(results[1].data,{ test: 2, data: { test: true } });
            });

        });
    });
});
