import assert from 'assert';
import apply_data_profile from '../src/lib/util-data-profile.js';


describe('util-data-profile', function() {

    it('Data Profile Name Does Not Exist', async function() {

        let results = await apply_data_profile({'@type': 'Event'}, 'core-no');

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

            console.log(results.results);

            assert.equal(results.done, true);
            assert.equal(results.results.length,2);
            assert.deepEqual(results.results[0].message,"should have required property 'cats'");
            assert.deepEqual(results.results[0].dataPath,"");
            assert.deepEqual(results.results[1].message,"should have required property 'dogs'");
            assert.deepEqual(results.results[1].dataPath,"location");

        })
        .then(() => done(), done)
        .catch((error) => {
            done(error);
        });
    });
});
