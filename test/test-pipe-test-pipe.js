import assert from 'assert';
import TestPipe from '../src/lib/pipes/test-pipe.js';


/**
 * It may seem silly to have tests for a test bit of code.
 * But the point is to illustrate how to test pipes.
 * Other people writing pipes should have a look.
 ***/

describe('test-pipe', function() {
    it('basic test', function(done) {

        let pipe = new TestPipe({id: 67, data_id: "ABC", data: {"test":true }}, []);
        let results_promise = pipe.run();
        results_promise.then((results)=> {

            assert.equal(results.length,2);
            assert.equal(results[0].kind, "TestKind");
            assert.deepEqual(results[0].data,{ type: "TestEvent", test: true, extra: "a test" } );
            assert.deepEqual(results[1].data,{ type: "TestEvent", test: true, extra: "b test" } );

        })
        .then(() => done(), done)
        .catch((error) => {
            done(error);
        });
    });
});
