import assert from 'assert';
import path from 'path';
import Utils from '../src/lib/utils.js';
import NormaliseEventPipe from '../src/lib/pipes/normalise-event-pipe.js';


describe('pipe-context', function() {
    it('should return the JSON-LD context', async function() {

        let pipe = new NormaliseEventPipe({id: 1, data: {}}, []);
        const context = await pipe.context;
        assert.equal(typeof context, "object");
        assert.equal("@context" in context, true);
        assert.equal("facilityUse" in context["@context"], true);

    });
});
