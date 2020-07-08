import assert from 'assert';
import NormaliseEventPipe from '../src/lib/pipes/normalise-event-pipe.js';


describe('pipe-fix-contexts', function(){
    it('should make the value of the @context property valid', function(done){
        try{
            // Uses the JSON-LD URL instead of the official namespace URI
            const badContexts1 = "https://www.openactive.io/ns/oa.jsonld";
            // Uses the JSON-LD URLs for OA and beta contexts
            const badContexts2 = [
                "https://www.openactive.io/ns/oa.jsonld",
                "https://www.openactive.io/ns-beta/oa.jsonld"
            ];
            // The OA context is not first
            const badContexts3 = [
                "https://example.org/custom.jsonld",
                "https://openactive.io/",
            ];
            // No OA context in an array of contexts
            const badContexts4 = [
                "https://example.org/custom.jsonld",
                "https://schema.org/",
            ];
            // No OA context and context isn't array
            const badContexts5 = "https://example.org/custom.jsonld";

            const goodContexts1 = "https://openactive.io/";
            const goodContexts2 = [
                "https://openactive.io/",
                "https://openactive.io/ns-beta/"

            ];
            const goodContexts3 = [
                "https://openactive.io/",
                "https://example.org/custom.jsonld",
            ];
            const goodContexts4 = [
                "https://openactive.io/",
                "https://example.org/custom.jsonld",
                "https://schema.org/",
            ];

            let pipe1 = new NormaliseEventPipe({id: 1, data: {"@context": badContexts1}}, []);
            pipe1.fixContext();
            assert.equal(pipe1.rawData["@context"], goodContexts1);

            let pipe2 = new NormaliseEventPipe({id: 2, data: {"@context": badContexts2}}, []);
            pipe2.fixContext();
            assert.deepEqual(pipe2.rawData["@context"], goodContexts2);

            let pipe3 = new NormaliseEventPipe({id: 3, data: {"@context": badContexts3}}, []);
            pipe3.fixContext();
            assert.deepEqual(pipe3.rawData["@context"], goodContexts3);

            let pipe4 = new NormaliseEventPipe({id: 4, data: {"@context": badContexts4}}, []);
            pipe4.fixContext();
            assert.deepEqual(pipe4.rawData["@context"], goodContexts4);

            let pipe5 = new NormaliseEventPipe({id: 5, data: {"@context": badContexts5}}, []);
            pipe5.fixContext();
            assert.deepEqual(pipe5.rawData["@context"], goodContexts3); // this is not a typo, 3 is correct for 5

            done();

        }catch(error){
            done(error);
        }
    });
});