import assert from 'assert';
import NormaliseEventPipe from '../src/lib/pipes/normalise-event-pipe.js';


describe('pipe-fix-contexts', function(){
    it('should replace the JSON-LD URL with the namespace URI from a string', function(done){
        try{
            const badContext = "https://www.openactive.io/ns/oa.jsonld";
            const goodContext = ["https://openactive.io/"];

            let pipe = new NormaliseEventPipe({id: 1, data: {"@context": badContext}}, []);
            pipe.fixContext();
            assert.deepEqual(pipe.rawData["@context"], goodContext);
            done();
        }catch(error){
            done(error);
        }
    });

    it('should replace the JSON-LD URLs with the namespace URIs from an array', function(done){
        try{
            const badContext = [
                "https://www.openactive.io/ns/oa.jsonld",
                "https://www.openactive.io/ns-beta/oa.jsonld"
            ];
            const goodContext = [
                "https://openactive.io/",
                "https://openactive.io/ns-beta/"
            ];
            let pipe = new NormaliseEventPipe({id: 1, data: {"@context": badContext}}, []);
            pipe.fixContext();
            assert.deepEqual(pipe.rawData["@context"], goodContext);
            done();
        }catch(error){
            done(error);
        }
    });

    it('should return the contexts array with the OA one first', function(done){
        try{
            const badContext = [
                "https://example.org/custom.jsonld",
                "https://openactive.io/",
            ];
            const goodContext = [
                "https://openactive.io/",
                "https://example.org/custom.jsonld",
            ];
            let pipe = new NormaliseEventPipe({id: 1, data: {"@context": badContext}}, []);
            pipe.fixContext();
            assert.deepEqual(pipe.rawData["@context"], goodContext);
            done();
        }catch(error){
            done(error);
        }
    });

    it('should add the OA context to the contexts array', function(done){
        try{
            const badContext = [
                "https://example.org/custom.jsonld",
                "https://schema.org/",
            ];
            const goodContext = [
                "https://openactive.io/",
                "https://example.org/custom.jsonld",
                "https://schema.org/",
            ];
            let pipe = new NormaliseEventPipe({id: 1, data: {"@context": badContext}}, []);
            pipe.fixContext();
            assert.deepEqual(pipe.rawData["@context"], goodContext);
            done();
        }catch(error){
            done(error);
        }
    });

    it('should make an array with the OA context and custom contexts in', function(done){
        try{
            const badContext = "https://example.org/custom.jsonld";
            const goodContext = [
                "https://openactive.io/",
                "https://example.org/custom.jsonld",
            ];
            let pipe = new NormaliseEventPipe({id: 1, data: {"@context": badContext}}, []);
            pipe.fixContext();
            assert.deepEqual(pipe.rawData["@context"], goodContext);
            done();
        }catch(error){
            done(error);
        }
    });
});