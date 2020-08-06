import assert from 'assert';
import path from 'path';
import Utils from '../src/lib/utils.js';
import NormaliseEventPipe from '../src/lib/pipes/normalise-event-pipe.js';


describe('valid-normalise-event', function() {
    it('should return a normalised Event object from data with no invalid or empty fields', async function() {

        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-valid-not-normalised.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-valid-normalised.json'));
        input.data_kind = input.kind;

        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.equal(results[0].kind, input.data_kind);
        assert.equal(typeof results[0].data.organizer, 'object');
        assert.equal(typeof results[0].data.activity, 'object');
        assert.deepEqual(results[0].data, output.data);

    });
});

describe('on-demand-event', function(){
    it('should return a normalised OnDemandEvent', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/on-demand-event.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/on-demand-event-normalised.json'));
        input.data_kind = input.kind;
        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.deepEqual(results[0].data, output.data);

    });
});

describe('headline-event', function(){
    it('should return a normalised HeadlineEvent', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/headline-event-with-subevents.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/headline-event-with-subevents-normalised.json'));
        input.data_kind = input.kind;

        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.deepEqual(results[0].data, output);
    });
});

describe('empty-event', function(){
    it('should skip over an event with no data value without crashing', async function(){
        const input = {id: 1234, data_deleted: true, data_kind: 'Event'};
        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();
        assert.equal(results.length, 0);
    });
});

describe('event-with-super', function(){
    it('should return a NormalisedEvent with data integrated from superEvent', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-with-superevent.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-with-superevent-normalised.json'));
        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.deepEqual(results[0].data, output.data);
    });
});

describe('session-with-sub', function(){
    it('should return a NormalisedEvent from data in SessionSeries and ScheduledSession', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/sessionseries-with-subevent.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/sessionseries-with-subevent-normalised.json'));

        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.deepEqual(results[0].data, output.data);
    });
});

describe('session-with-super', function(){
    it('should merge data from embedded super SessionSeries with ScheduledSession', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/scheduledsession-with-superevent.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/sessionseries-with-subevent-normalised.json'));

        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.deepEqual(results[0].data, output.data);
    });

    it('should merge data from referenced super SessionSeries with ScheduledSession', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/scheduledsession-referenced-superevent.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/scheduledsession-referenced-superevent-normalised.json'));

        // Mock superEvent retrieval from db
        const superEventData = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/sessionseries.json'));
        let pipe = new NormaliseEventPipe(input, []);
        pipe.selectRawByDataId = function(dataId){
            return {
                "id": "123",
                "data": superEventData.data
            };
        }
        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.equal(results[0].parentId, '123');
        assert.deepEqual(results[0].data, output.data);
    });

    it('should merge data from referenced super SessionSeries with ScheduledSession (2)', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/scheduledsession-referenced-superevent-2.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/scheduledsession-referenced-superevent-normalised-2.json'));

        // Mock superEvent retrieval from db
        const superEventData = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/sessionseries-2.json'));
        let pipe = new NormaliseEventPipe(input, []);
        pipe.selectRawByDataId = function(dataId){
            return {
                "id": "456",
                "data": superEventData.data
            };
        }

        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.equal(results[0].parentId, '456');
        assert.deepEqual(results[0].data, output.data);
    });
});

describe('course-instance', function(){
    it('should return a NormalisedEvent from a CourseInstance with a sub event', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/courseinstance.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/courseinstance-normalised.json'));

        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,1);
        assert.deepEqual(results[0].data, output.data);
    });
});

describe('test-errors', function(){
    it('should set an error for a missing superEvent', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/scheduledsession-referenced-superevent-2.json'));
        const error = {"missingSuperEvent": `No raw_data with data_id [https://ncc.leisurecloud.net/OpenActive/api/session-series/HRES0001802]`}

        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();
        assert.equal(results[0].errors.length, 1);
        assert.deepEqual(results[0].errors[0], error);
    });

    it('should set an error for an invalid superEvent value', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/scheduledsession-referenced-superevent-2.json'));
        input.data.superEvent = "notavaliduri";
        const error = {"invalidSuperEvent": `Can't process superEvent value [notavaliduri]`}

        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();
        assert.equal(results[0].errors.length, 1);
        assert.deepEqual(results[0].errors[0], error);
    });

    it('should set an error for an invalid superEvent type', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/scheduledsession-referenced-superevent-2.json'));
        input.data.superEvent = ["https://example.org/superevent"];
        const error = {"invalidSuperEvent": `Can't process superEvent value [https://example.org/superevent]`}

        let pipe = new NormaliseEventPipe(input, []);
        let results = await pipe.run();
        assert.equal(results[0].errors.length, 1);
        assert.deepEqual(results[0].errors[0], error);
    });
});