import assert from 'assert';
import apply_data_profile from '../src/lib/util-data-profile.js';


describe('util-data-profile', function() {

    it('Data Profile Name Does Not Exist', async function() {

        let results = await apply_data_profile({'@type': 'Event'}, 'kangaroos');

        assert.equal(results.done,false);
        assert.equal(results.error,"Data Profile Does Not Exist");

    });

    it('Test', function(done) {

        let results_promise = apply_data_profile(
            {
                '@type': 'Event',
                'location': {
                    '@type': 'Place'
                }
            },
            'core'
        );
        results_promise.then((results)=> {

            assert.equal(results.done, true);
            assert.equal(results.results.length,22);
            // Just test a couple
            assert.deepEqual(results.results[0].message,"should have required property 'activity'");
            assert.deepEqual(results.results[0].dataPath,"");
            assert.deepEqual(results.results[6].message,"should have required property 'address'");
            assert.deepEqual(results.results[6].dataPath,".location");

        })
        .then(() => done(), done)
        .catch((error) => {
            done(error);
        });
    });
});
