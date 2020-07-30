import assert from 'assert';
import {cache, Utils} from '../src/lib/utils.js';


describe('makeNextURL', function() {
    it('should return absolute URLs fine', function() {
      assert.equal(Utils.makeNextURL("http://example.com/", "https://www.openactive.io/"),"https://www.openactive.io/");
    });
    it('should return relative URLs fine', function() {
      assert.equal(Utils.makeNextURL("https://www.openactive.io/", "/cat"),"https://www.openactive.io/cat");
    });
});


describe('getContext', function() {
    it('should return the JSON-LD context', async function() {

        try{
            const context = await Utils.getContext();
            assert.equal(typeof context, "object");
            assert.equal("@context" in context, true);
            assert.notEqual(Object.keys(context["@context"]).length, 0);
            assert.equal("facilityUse" in context["@context"], true);
        }catch(error){
            console.error(error);
        }

    });
});

describe('getIdFromData', function(){
    it('should return the @id value', function(){
        const data = {
            "@id": "https://example.org/events/1",
            "id": "https://example.org/events/2",
            "identifier": "event1"
        }
        const id = Utils.getIdFromData(data);
        assert.equal(id, "https://example.org/events/1");
    });

    it('should return the id value', function(){
        const data = {
            "id": "https://example.org/events/2",
            "identifier": "event1"
        }
        const id = Utils.getIdFromData(data);
        assert.equal(id, "https://example.org/events/2");
    });

    it('should return undefined if id is not a HTTP URI', function(){
        const data = {
            "@id": "event1"
        }
        const id = Utils.getIdFromData(data);
        assert.deepEqual(id, undefined);
    });

    it('should return undefined if @id/id is undefined', function(){
        const id = Utils.getIdFromData({"blah": "nothing"});
        assert.deepEqual(id, undefined);
    });

    it('should return undefined if data is undefined', function(){
        const id = Utils.getIdFromData(undefined);
        assert.deepEqual(id, undefined);
    });

    it('should return undefined if data is null', function(){
        const id = Utils.getIdFromData(null);
        assert.deepEqual(id, undefined);
    });
});

describe('activities-cache', function(){
    it('should load the remote Activity List into the cache', async function(){
        assert.equal(Object.keys(cache.activities).length, 0);
        try{
            await Utils.loadActivitiesJSONIntoCache();
        }catch(e){
            console.log(e);
        }
        assert.equal(Object.keys(cache.activities).length>0,true);
    });
});