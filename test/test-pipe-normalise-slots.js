import assert from 'assert';
import path from 'path';
import Utils from '../src/lib/utils.js';
import NormaliseSlotPipe from '../src/lib/pipes/normalise-slot-pipe.js';


describe('individualfacilityuse-embedded-slot', function() {
    it('should generate two Slots from an IndividualFacilityUse with event property', async function() {
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/individualfacilityuse-embedded-slot.json'));
        input.data_kind = input.kind;

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,2);
    });
});

describe('individualfacilityuse-embedded-slot', function() {
    it('should generate events with Slot type', async function() {
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/individualfacilityuse-embedded-slot.json'));
        input.data_kind = input.kind;

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();

        assert.equal(results[0].data["@type"],"Slot");
    });
});

describe('individualfacilityuse-embedded-slot', function() {
    it('should generate Slots with properties from parent IndividualFacilityUse', async function() {
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/individualfacilityuse-embedded-slot.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/individualfacilityuse-embedded-slot-normalised.json'));
        input.data_kind = input.kind;

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();

        assert.deepEqual(results[0].data,output[0].data);
    });
});

describe('facilityuse-embedded-slot', function() {
    it('should generate two Slots from a FacilityUse with event property', async function() {
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse-embedded-slot.json'));
        input.data_kind = input.kind;

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,2);
    });
});

describe('facilityuse-embedded-slot', function() {
    it('should generate events with Slot type', async function() {
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse-embedded-slot.json'));
        input.data_kind = input.kind;

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();

        assert.equal(results[0].data["@type"],"Slot");
    });
});

describe('facilityuse-embedded-slot', function() {
    it('should generate Slots with properties from parent FacilityUse', async function() {
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse-embedded-slot.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse-embedded-slot-normalised.json'));
        input.data_kind = input.kind;

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();

        assert.deepEqual(results[0].data,output[0].data);
    });
});
