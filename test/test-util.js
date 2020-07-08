import assert from 'assert';
import Utils from '../src/lib/utils.js';


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