import assert from 'assert';
import path from 'path';
import Utils from '../src/lib/utils.js';
import NormaliseEventPipe from '../src/lib/pipes/normalise-event-pipe.js';


describe('valid-normalise-event', function() {
    it('should return a normalised Event object from data with no invalid or empty fields', async function() {

        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-valid-not-normalised.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-valid-normalised.json'));

        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.equal(results[0].kind, 'Event');
        assert.equal(typeof results[0].data.organizer, 'object');
        assert.equal(typeof results[0].data.activity, 'object');
        assert.deepEqual(results[0].data, output.data);

    });
});

describe('normalise-event', function() {
    it('should return a normalised Event object from data which contains invalid or empty fields', async function() {

        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-not-normalised.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));

        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.equal(results[0].kind, 'Event');
        assert.equal(typeof results[0].data.organizer, 'object');
        assert.equal(typeof results[0].data.activity, 'object');
        assert.deepEqual(results[0].data, output.data);

    });
});

describe('on-demand-event', function(){
    it('should return a normalised OnDemandEvent', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/on-demand-event.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/on-demand-event-normalised.json'));
        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.deepEqual(results[0].data, output.data);

    });
});
