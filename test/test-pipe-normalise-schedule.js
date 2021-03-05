import assert from 'assert';
import path from 'path';
import Utils from '../src/lib/utils.js';
import NormaliseSchedulePipe from '../src/lib/pipes/normalise-schedule-pipe.js';


describe('course-schedule', function() {
    it('should generate two events from a Course with eventSchedule between certain dates', async function() {

       const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/course-with-schedule.json'));
       let pipe = new NormaliseSchedulePipe(input, []);

       // Mock eventsFrom and eventsUntil in pipe so it always returns a fixed date, since the dates are hardcoded in 'output' json
       pipe.eventsFrom = function(){
            return new Date("2020-04-30T00:00:00.000Z");
        }
        pipe.eventsUntil = function(){
            return new Date("2020-05-14T00:00:00.000Z");
        }

       let results = await pipe.run();
       assert.equal(results.length,2);

    });

    it('should generate the correct kind and type for subevents from a Course with eventSchedule', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/course-with-schedule.json'));
        input.data_kind = input.kind;
        let pipe = new NormaliseSchedulePipe(input, []);

        // Mock eventsFrom and eventsUntil in pipe so it always returns a fixed date, since the dates are hardcoded in 'output' json
        pipe.eventsFrom = function(){
            return new Date("2020-04-30T00:00:00.000Z");
        }
        pipe.eventsUntil = function(){
            return new Date("2020-05-14T00:00:00.000Z");
        }

        let results = await pipe.run();
        assert.equal(results[0].kind, "CourseInstanceSubEvent");
        assert.equal(results[0].data["@type"], "Event");
    });

    it('should generate two correct Normalised Events from a Course with eventSchedule', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/course-with-schedule.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/course-with-schedule-normalised.json'));
        input.data_kind = input.kind;
        let pipe = new NormaliseSchedulePipe(input, []);

        // Mock eventsFrom and eventsUntil in pipe so it always returns a fixed date, since the dates are hardcoded in 'output' json
        pipe.eventsFrom = function(){
            return new Date("2020-04-30T00:00:00.000Z");
        }
        pipe.eventsUntil = function(){
            return new Date("2020-05-14T00:00:00.000Z");
        }

        let results = await pipe.run();
        assert.deepEqual(results[0].data, output[0].data);
        assert.deepEqual(results[1].data, output[1].data);
    });

});

describe('session-schedule', function() {

    it('should generate two correct Normalised Events from a SessionSeries with eventSchedule', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/sessionseries-with-schedule.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/sessionseries-with-schedule-normalised.json'));
        input.data_kind = input.kind;
        let pipe = new NormaliseSchedulePipe(input, []);

        // Mock eventsFrom and eventsUntil in pipe so it always returns a fixed date, since the dates are hardcoded in 'output' json
        pipe.eventsFrom = function(){
            return new Date("2020-07-22T00:00:00.000Z");
        }
        pipe.eventsUntil = function(){
            return new Date("2020-08-05T00:00:00.000Z");
        }

        let results = await pipe.run();
        assert.deepEqual(results[0].data, output[0].data);
        assert.deepEqual(results[1].data, output[1].data);
    });

    it('should generate one Normalised Event from a SessionSeries with eventSchedule with exceptDates', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/sessionseries-with-schedule-exdates.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/sessionseries-with-schedule-exdates-normalised.json'));
        input.data_kind = input.kind;
        let pipe = new NormaliseSchedulePipe(input, []);

        // Mock eventsFrom and eventsUntil in pipe so it always returns a fixed date, since the dates are hardcoded in 'output' json
        pipe.eventsFrom = function(){
            return new Date("2020-07-22T00:00:00.000Z");
        }
        pipe.eventsUntil = function(){
            return new Date("2020-08-05T00:00:00.000Z");
        }

        // // We are now correcting for timezone in the rrule, so set the time in the fixture to the correct timezone
        // for (const schedule in output) {
        //     console.info(schedule)
        //     schedule.data.startDate = new Date(schedule.data.startDate).toLocaleString("en-GB", {timezone: "Europe/London"})
        // }

        let results = await pipe.run();
        assert.equal(results.length,1);
        assert.deepEqual(results[0].data, output[0].data);
    });

});

describe('error-handling', function() {

    it('should generate events when byDay value uses http', async function() {

        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/course-schedule-httpday.json'));
        let pipe = new NormaliseSchedulePipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,2);

    });

});
