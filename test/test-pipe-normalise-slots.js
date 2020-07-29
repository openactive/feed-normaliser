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

    it('should generate events with Slot type', async function() {
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/individualfacilityuse-embedded-slot.json'));
        input.data_kind = input.kind;

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();

        assert.equal(results[0].data["@type"],"Slot");
    });

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

    it('should generate events with Slot type', async function() {
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse-embedded-slot.json'));
        input.data_kind = input.kind;

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();

        assert.equal(results[0].data["@type"],"Slot");
    });

    it('should generate Slots with properties from parent FacilityUse', async function() {
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse-embedded-slot.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse-embedded-slot-normalised.json'));
        input.data_kind = input.kind;

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();

        assert.deepEqual(results[0].data,output[0].data);
    });
});

describe('facilityuse-ifu-slot', function(){
    it('should generate three Slots from two embedded IndividualFacilityUse on one FacilityUse', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse-ifu-slots.json'));

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();

        assert.equal(results.length,3);
    });

    it('should generate three Slots with data from IFU and FU', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse-ifu-slots.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse-ifu-slots-normalised.json'));
        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();
        assert.deepEqual(results[0].data,output[0].data);
        assert.deepEqual(results[1].data,output[1].data);
        assert.deepEqual(results[2].data,output[2].data);
    });
});

describe('ifu-facilityuse-slot', function(){
    it('should generate two Slots from an IFU', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/ifu-facilityuse-slots.json'));

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();
        assert.equal(results.length,2);
    });

    it('should generate two Slots with data from parent IFU and nested FU', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/ifu-facilityuse-slots.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/ifu-facilityuse-slots-normalised.json'));

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();
        assert.deepEqual(results[0].data,output[0].data);
        assert.deepEqual(results[1].data,output[1].data);
    });
});

describe('slot-referenced-facilityuse', function(){
    it('should merge data into Slot from referenced FacilityUse', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/slot-referenced-facilityuse.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/slot-referenced-facilityuse-normalised.json'));

        // Mock facilityUse retrieval from db
        const facilityuseData = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse.json'));
        let pipe = new NormaliseSlotPipe(input, []);
        pipe.selectRawByDataId = function(dataId){
            return {
                "id": "abc",
                "data": facilityuseData.data
            };
        }

        let results = await pipe.run();
        assert.equal(results[0].parentId, "abc");
        assert.equal(results.length,1);
        assert.deepEqual(results[0].data,output.data);
    });

    it('should merge data into Slot from referenced FacilityUse (2)', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/slot-referenced-facilityuse-2.json'));
        const output = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/slot-referenced-facilityuse-normalised-2.json'));

        // Mock facilityUse retrieval from db
        const facilityuseData = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/facilityuse-2.json'));
        let pipe = new NormaliseSlotPipe(input, []);
        pipe.selectRawByDataId = function(dataId){
            return {
                "id": "def",
                "data": facilityuseData.data
            };
        }

        let results = await pipe.run();
        assert.equal(results[0].parentId, "def");
        assert.equal(results.length,1);
        assert.deepEqual(results[0].data,output.data);
    });
});

describe('test-errors', function(){
    it('should set an error for a missing facilityUse', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/slot-referenced-facilityuse-2.json'));
        const error = {"missingFacilityUse": `No raw_data with data_id [https://lincsinspire-openactive.legendonlineservices.co.uk/api/facility-uses/10-3]`}

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();
        assert.equal(results[0].errors.length, 1);
        assert.deepEqual(results[0].errors[0], error);
    });

    it('should set an error for an invalid facilityUse value', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/slot-referenced-facilityuse-2.json'));
        input.data.facilityUse = "notavaliduri";
        const error = {"invalidFacilityUse": `Can't process facilityUse value [notavaliduri]`}

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();
        assert.equal(results[0].errors.length, 1);
        assert.deepEqual(results[0].errors[0], error);
    });

    it('should set an error for an invalid facilityUse type', async function(){
        const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/slot-referenced-facilityuse-2.json'));
        input.data.facilityUse = ["https://example.org/fu"];
        const error = {"invalidFacilityUse": `Can't process facilityUse value [https://example.org/fu]`}

        let pipe = new NormaliseSlotPipe(input, []);
        let results = await pipe.run();
        assert.equal(results[0].errors.length, 1);
        assert.deepEqual(results[0].errors[0], error);
    });
});