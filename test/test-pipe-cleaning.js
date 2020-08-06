import assert from 'assert';
import path from 'path';
import Utils from '../src/lib/utils.js';
import NormaliseEventPipe from '../src/lib/pipes/normalise-event-pipe.js';
import CleaningPipe from '../src/lib/pipes/cleaning-pipe.js';

describe('normalise-event', function() {
    it('should return a normalised Event object from data which contains invalid or empty fields', async function() {

        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-not-normalised.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));
        input.data_kind = input.kind;

        let eventPipe = new NormaliseEventPipe(input, []);
        let normalisedEvents = await eventPipe.run();
        let cleanupPipe = new CleaningPipe(input, normalisedEvents);
        let results = await cleanupPipe.run();

        assert.equal(results.length,1);
        assert.equal(results[0].data.leader, undefined);
        assert.equal(typeof results[0].data.invalidAttribute, 'object');
        assert.deepEqual(results[0].data, output.data);

    });
});