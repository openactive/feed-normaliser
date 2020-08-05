import assert from 'assert';
import { migrate_database, delete_database, database_pool  }  from '../src/lib/database.js';
import Settings from '../src/lib/settings.js';
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

describe('pipe-fix-ids', function(){
    it('should replace top level id with @id', function(done){
        try{
            const input = {
                "@context": ["https://openactive.io/"],
                "id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event"
            }
            const output = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event"
            }
            let pipe = new NormaliseEventPipe({id: 1, data: input}, []);
            pipe.fixId();
            assert.deepEqual(pipe.rawData, output);
            done();
        }catch(error){
            done(error);
        }
    });

    it('should replace id in nested object with @id', function(done){
        try{
            const input = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event",
                "offers": {
                   "@type": "Offer",
                   "id": "http://www.goodgym.org/api/happenings/hill-session-with-tom#offer",
                   "price": "0"
                 }
            }
            const output = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event",
                "offers": {
                   "@type": "Offer",
                   "@id": "http://www.goodgym.org/api/happenings/hill-session-with-tom#offer",
                   "price": "0"
                 }
            }
            let pipe = new NormaliseEventPipe({id: 1, data: input}, []);
            pipe.fixId();
            assert.deepEqual(pipe.rawData, output);
            done();
        }catch(error){
            done(error);
        }
    });

    it('should replace id in nested array object with @id', function(done){
        try{
            const input = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event",
                "subEvent": [
                    {
                        "id": "https://opportunity.example/event/2",
                        "@type": "Event",
                        "name": "A sub event"
                    }
                ]
            }
            const output = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event",
                "subEvent": [
                    {
                        "@id": "https://opportunity.example/event/2",
                        "@type": "Event",
                        "name": "A sub event"
                    }
                ]
            }
            let pipe = new NormaliseEventPipe({id: 1, data: input}, []);
            pipe.fixId();
            assert.deepEqual(pipe.rawData, output);
            done();
        }catch(error){
            done(error);
        }
    });

    it('should replace both top level id and id in nested array object with @id', function(done){
        try{
            const input = {
                "@context": ["https://openactive.io/"],
                "id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event",
                "subEvent": [
                    {
                        "id": "https://opportunity.example/event/2",
                        "@type": "Event",
                        "name": "A sub event"
                    }
                ]
            }
            const output = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event",
                "subEvent": [
                    {
                        "@id": "https://opportunity.example/event/2",
                        "@type": "Event",
                        "name": "A sub event"
                    }
                ]
            }
            let pipe = new NormaliseEventPipe({id: 1, data: input}, []);
            pipe.fixId();
            assert.deepEqual(pipe.rawData, output);
            done();
        }catch(error){
            done(error);
        }
    });
});

describe('pipe-fix-types', function(){
    it('should replace top level type with @type', function(done){
        try{
            const input = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "type": "Event",
                "name": "An event"
            }
            const output = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event"
            }
            let pipe = new NormaliseEventPipe({id: 1, data: input}, []);
            pipe.fixType();
            assert.deepEqual(pipe.rawData, output);
            done();
        }catch(error){
            done(error);
        }
    });

    it('should replace type in nested object with @type', function(done){
        try{
            const input = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event",
                "offers": {
                   "type": "Offer",
                   "@id": "http://www.goodgym.org/api/happenings/hill-session-with-tom#offer",
                   "price": "0"
                 }
            }
            const output = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event",
                "offers": {
                   "@type": "Offer",
                   "@id": "http://www.goodgym.org/api/happenings/hill-session-with-tom#offer",
                   "price": "0"
                 }
            }
            let pipe = new NormaliseEventPipe({id: 1, data: input}, []);
            pipe.fixType();
            assert.deepEqual(pipe.rawData, output);
            done();
        }catch(error){
            done(error);
        }
    });

    it('should replace type in nested array object with @type', function(done){
        try{
            const input = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event",
                "subEvent": [
                    {
                        "@id": "https://opportunity.example/event/2",
                        "type": "Event",
                        "name": "A sub event"
                    }
                ]
            }
            const output = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event",
                "subEvent": [
                    {
                        "@id": "https://opportunity.example/event/2",
                        "@type": "Event",
                        "name": "A sub event"
                    }
                ]
            }
            let pipe = new NormaliseEventPipe({id: 1, data: input}, []);
            pipe.fixType();
            assert.deepEqual(pipe.rawData, output);
            done();
        }catch(error){
            done(error);
        }
    });

    it('should replace both top level type and type in nested array object with @type', function(done){
        try{
            const input = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "type": "Event",
                "name": "An event",
                "subEvent": [
                    {
                        "@id": "https://opportunity.example/event/2",
                        "type": "Event",
                        "name": "A sub event"
                    }
                ]
            }
            const output = {
                "@context": ["https://openactive.io/"],
                "@id": "https://opportunity.example/event/1",
                "@type": "Event",
                "name": "An event",
                "subEvent": [
                    {
                        "@id": "https://opportunity.example/event/2",
                        "@type": "Event",
                        "name": "A sub event"
                    }
                ]
            }
            let pipe = new NormaliseEventPipe({id: 1, data: input}, []);
            pipe.fixType();
            assert.deepEqual(pipe.rawData, output);
            done();
        }catch(error){
            done(error);
        }
    });
});

describe('pipe-rawdata-lookup', function(){
    it('should get one row from the raw_data table', async function(){
        const event = {
            "@context": ["https://openactive.io/"],
            "@id": "https://opportunity.example/event/1",
            "@type": "Event",
            "superEvent": "https://opportunity.example/headline"
        }
        const superEvent = {
            "@context": ["https://openactive.io/"],
            "@id": "https://opportunity.example/headline",
            "@type": "HeadlineEvent",
        }

        // Init database
        await delete_database();
        await migrate_database();
        let client = await database_pool.connect();
        let rawId;
        try {
            // Insert test data
            // Publisher
            const insertPublisher = await client.query('INSERT INTO publisher (name, url) VALUES ($1, $2) RETURNING id', ["Test", "http://test.com"]);
            const publisherId = insertPublisher.rows[0].id;
            // Publisher Feed
            const insertFeed = await client.query('INSERT INTO publisher_feed (publisher_id, name, url) VALUES ($1, $2, $3) RETURNING id', [publisherId, "Things","http://test.com/things"]);
            const publisherFeedId = insertFeed.rows[0].id;
            // Raw data
            const superEventQueryData = [
                publisherFeedId, 555, "https://opportunity.example/headline", "f", "HeadlineEvent", 1574378246837, superEvent
            ];
            const insertRaw = await client.query('INSERT INTO raw_data (publisher_feed_id, rpde_id, data_id, data_deleted, data_kind, data_modified, data, normalised) VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE) RETURNING id', superEventQueryData);
            rawId = insertRaw.rows[0].id;
        }catch(error){
            console.log('Error inserting test data');
            console.log(error);
        }finally{
            await client.release();
        }

        let pipe = new NormaliseEventPipe({id: 1, data: event}, []);
        let result = await pipe.selectRawByDataId(event.superEvent);
        assert.equal(result.id, rawId);
        assert.equal(typeof result.data, "object");
    });

});