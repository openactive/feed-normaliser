import assert from 'assert';
import path from 'path';
import { cache, Utils } from '../src/lib/utils.js';
import ActivitiesPipe from '../src/lib/pipes/activities-pipe.js';
import NormalisedEvent from '../src/lib/normalised-event.js';



describe('activity-string-matching', function() {

    it('finds the word yoga in a longer string', async function() {
      const description = "These beginner yoga classes are fun for all the family";
      const pipe = new ActivitiesPipe({},[]);
      let result = await pipe.searchTextForActivity(description, "yoga");
      assert.equal(result,true);
    });

    it('does not find the word yoga in a longer string', async function() {
      const description = "These beginner tennis classes are fun for all the family";
      const pipe = new ActivitiesPipe({},[]);
      let result = await pipe.searchTextForActivity(description, "yoga");
      assert.equal(result,false);
    });

    it('does not find the word gin when it is a substring', async function() {
      const description = "These beginner yoga classes are fun for all the family";
      const pipe = new ActivitiesPipe({},[]);
      let result = await pipe.searchTextForActivity(description, "gin");
      assert.equal(result,false);
    });

});

describe('activity-id-fixing', function(){

  it('leaves a valid activity id unchanged', function(){
    const uri = "https://openactive.io/activity-list#1a2b3c4d";
    const pipe = new ActivitiesPipe({},[]);
    let result = pipe.normaliseActivityId(uri);
    assert.equal(result,uri);
  });

  it('fixes http URIs', function(){
    const uri = "https://openactive.io/activity-list#1a2b3c4d";
    const pipe = new ActivitiesPipe({},[]);
    let result = pipe.normaliseActivityId("http://openactive.io/activity-list#1a2b3c4d");
    assert.equal(result,uri);
  });

  it('fixes URIs with www', function(){
    const uri = "https://openactive.io/activity-list#1a2b3c4d";
    const pipe = new ActivitiesPipe({},[]);
    let result = pipe.normaliseActivityId("https://www.openactive.io/activity-list#1a2b3c4d");
    assert.equal(result,uri);
  });

  it('fixes URIs with extra forward slash', function(){
    const uri = "https://openactive.io/activity-list#1a2b3c4d";
    const pipe = new ActivitiesPipe({},[]);
    let result = pipe.normaliseActivityId("https://openactive.io/activity-list/#1a2b3c4d");
    assert.equal(result,uri);
  });

  it('fixes URIs with http, www and extra forward slash', function(){
    const uri = "https://openactive.io/activity-list#1a2b3c4d";
    const pipe = new ActivitiesPipe({},[]);
    let result = pipe.normaliseActivityId("http://www.openactive.io/activity-list/#1a2b3c4d");
    assert.equal(result,uri);
  });

});

describe('getting-activity-labels', function(){

  it('gets pref labels', function(){
    cache.activities.byId = {
      "https://openactive.io/activity-list#7f4": {
        id: "https://openactive.io/activity-list#7f4",
        identifier: "7f4",
        type: "Concept",
        prefLabel: "Haggis chasing",
        broader: [
          "https://openactive.io/activity-list#78503fa2-ed24-4a80-a224-e2e94581d8a8"
        ],
        definition: "A traditional Scottish coming-of-age ritual",
        notation: "haggis_chasing"
      },
      "https://openactive.io/activity-list#8d3": {
        id: "https://openactive.io/activity-list#8d3",
        identifier: "7f4",
        type: "Concept",
        prefLabel: "Caber tossing",
        definition: "An event that takes place during the Highland Games",
        notation: "caber_tossing"
      }
    };

    const pipe = new ActivitiesPipe({},[]);
    let result = pipe.getActivityLabels("https://openactive.io/activity-list#7f4");
    assert.equal(result.length,1);
    assert.equal(result[0], "Haggis chasing");
  });

  it('gets alt labels', function(){
    cache.activities.byId = {
      "https://openactive.io/activity-list#7f4": {
        id: "https://openactive.io/activity-list#7f4",
        identifier: "7f4",
        type: "Concept",
        prefLabel: "Haggis chasing",
        altLabel: ["Chasing yer taigeis"],
        broader: [
          "https://openactive.io/activity-list#78503fa2-ed24-4a80-a224-e2e94581d8a8"
        ],
        definition: "A traditional Scottish coming-of-age ritual",
        notation: "haggis_chasing"
      }
    };
    const pipe = new ActivitiesPipe({},[]);
    let result = pipe.getActivityLabels("https://openactive.io/activity-list#7f4");
    assert.equal(result.length,2);
    assert.equal(result[0], "Haggis chasing");
    assert.equal(result[1], "Chasing yer taigeis");
  });

});

describe('getting-broader-activities', function(){
  it('should get labels for activities broader in the hierarchy', function(){
    cache.activities.byId = {
      "https://openactive.io/activity-list#f816f3b5-3128-4421-b71a-25cc7c1e1880": {
        "identifier": "f816f3b5-3128-4421-b71a-25cc7c1e1880",
        "type": "Concept",
        "prefLabel": "6-a-side",
        "broader": [
          "https://openactive.io/activity-list#22fe3033-b0e4-4717-8455-599180b5bcba"
        ],
        "notation": "6_a_side"
      },
      "https://openactive.io/activity-list#22fe3033-b0e4-4717-8455-599180b5bcba": {
        "identifier": "22fe3033-b0e4-4717-8455-599180b5bcba",
        "type": "Concept",
        "prefLabel": "Small Sided Football",
        "broader": [
          "https://openactive.io/activity-list#0a5f732d-e806-4e51-ad40-0a7de0239c8c"
        ],
        "notation": "small_sided_football"
      },
      "https://openactive.io/activity-list#0a5f732d-e806-4e51-ad40-0a7de0239c8c": {
        "identifier": "0a5f732d-e806-4e51-ad40-0a7de0239c8c",
        "type": "Concept",
        "prefLabel": "Football",
        "definition": "Football is widely considered to be the most popular sport in the world. The beautiful game is England's national sport.",
        "notation": "football",
        "topConceptOf": "https://openactive.io/activity-list"
      },
      "https://openactive.io/activity-list#4ba72fbb-fc08-4f3e-b779-342be690bc1c": {
        "identifier": "4ba72fbb-fc08-4f3e-b779-342be690bc1c",
        "type": "Concept",
        "prefLabel": "Footgolf",
        "definition": "Footgolf is played on a golf course using a size 5 football.",
        "notation": "footgolf",
        "topConceptOf": "https://openactive.io/activity-list"
      }
    };
    const pipe = new ActivitiesPipe({},[]);
    let result = pipe.getBroaderActivities("https://openactive.io/activity-list#f816f3b5-3128-4421-b71a-25cc7c1e1880");
    assert.equal(result.length,2);
    assert.equal(result[0]["prefLabel"], "Small Sided Football");
    assert.equal(result[1]["prefLabel"], "Football");
  });
});

describe('augment-activities', function(){

  // Each of these resets the activities cache so it's fetched again
  // as previous tests modified it
  // Very occasionally the get request might take too long and a test
  // times out.. just run them again..

  it('should not drop any non-OA activities', async function(){
    cache.activities = {};
    const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));
    const inputActivity = [
      {
        "@id": "https://example.org/activity/running",
        "@type": "Concept",
        "inScheme": "https://example.org/activitylist"
      }
    ];
    input.data.description = "asdf!";
    input.data.activity = [...inputActivity];
    const normEvent = new NormalisedEvent(input.data, "Event");
    const pipe = new ActivitiesPipe(input.data, [normEvent]);
    let result = await pipe.run();
    assert.deepEqual(result[0].data.activity, inputActivity);
  });

  it('should not drop activity with id not in OA list', async function(){
    cache.activities = {};
    const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));
    const inputActivity = [
      {
        "@id": "https://example.org/activity/running",
        "@type": "Concept",
        "prefLabel": "Running"
      }
    ];
    input.data.description = "asdf!";
    input.data.activity = [...inputActivity];
    const normEvent = new NormalisedEvent(input.data, "Event");
    const pipe = new ActivitiesPipe(input.data, [normEvent]);
    let result = await pipe.run();
    assert.deepEqual(result[0].data.activity, inputActivity);
  });

  it('should not drop activity with label not in OA list', async function(){
    cache.activities = {};
    const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));
    const inputActivity = [
      {
        "@type": "Concept",
        "prefLabel": "asdfasdf"
      }
    ];
    input.data.description = "asdf!";
    input.data.activity = [...inputActivity];
    const normEvent = new NormalisedEvent(input.data, "Event");
    const pipe = new ActivitiesPipe(input.data, [normEvent]);
    let result = await pipe.run();
    assert.deepEqual(result[0].data.activity, inputActivity);
  });

  it('should add labels when only id provided', async function(){
    cache.activities = {};
    const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));
    const inputActivity = [
      {
        "@id": "https://openactive.io/activity-list#72ddb2dc-7d75-424e-880a-d90eabe91381"
      }
    ];
    const outputActivity = [
      {
        "@id": "https://openactive.io/activity-list#72ddb2dc-7d75-424e-880a-d90eabe91381",
        "@type": "Concept",
        "prefLabel": "Running",
        "inScheme": "https://openactive.io/activity-list"
      }
    ];
    input.data.description = "asdf!";
    input.data.activity = [...inputActivity];
    const normEvent = new NormalisedEvent(input.data, "Event");
    const pipe = new ActivitiesPipe(input.data, [normEvent]);
    let result = await pipe.run();
    assert.deepEqual(result[0].data.activity, outputActivity);
  });

  it('should add id when only label provided', async function(){
    cache.activities = {};
    const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));
    const inputActivity = [
      {
        "@type": "Concept",
        "prefLabel": "Running"
      }
    ];
    const outputActivity = [
      {
        "@id": "https://openactive.io/activity-list#72ddb2dc-7d75-424e-880a-d90eabe91381",
        "@type": "Concept",
        "prefLabel": "Running",
        "inScheme": "https://openactive.io/activity-list"
      }
    ];
    input.data.description = "asdf!";
    input.data.activity = [...inputActivity];
    const normEvent = new NormalisedEvent(input.data, "Event");
    const pipe = new ActivitiesPipe(input.data, [normEvent]);
    let result = await pipe.run();
    assert.deepEqual(result[0].data.activity, outputActivity);
  });

  it('should add id and set to OA prefLabel when only label provided and it is an altLabel', async function(){
    cache.activities = {};
    const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));
    const inputActivity = [
      {
        "@type": "Concept",
        "prefLabel": "Rambling"
      }
    ];
    const outputActivity = [
      {
        "@id": "https://openactive.io/activity-list#95092977-5a20-4d6e-b312-8fddabe71544",
        "@type": "Concept",
        "prefLabel": "Walking",
        "inScheme": "https://openactive.io/activity-list"
      }
    ];
    input.data.description = "asdf!";
    input.data.activity = [...inputActivity];
    const normEvent = new NormalisedEvent(input.data, "Event");
    const pipe = new ActivitiesPipe(input.data, [normEvent]);
    let result = await pipe.run();
    assert.deepEqual(result[0].data.activity, outputActivity);
  });

  it('should add broader activities', async function(){
    cache.activities = {};
    const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));
    const inputActivity = [
      {
        "id": "https://openactive.io/activity-list#90346371-03e3-47c8-a25d-07e976b4a4c8",
        "prefLabel": "Fell Running"
      }
    ];
    const outputActivity = [
      {
        "@id": "https://openactive.io/activity-list#90346371-03e3-47c8-a25d-07e976b4a4c8",
        "@type": "Concept",
        "prefLabel": "Fell Running",
        "inScheme": "https://openactive.io/activity-list"
      },
      {
        "@id": "https://openactive.io/activity-list#72ddb2dc-7d75-424e-880a-d90eabe91381",
        "@type": "Concept",
        "prefLabel": "Running",
        "inScheme": "https://openactive.io/activity-list"
      }
    ];
    input.data.description = "asdf!";
    input.data.activity = [...inputActivity];
    const normEvent = new NormalisedEvent(input.data, "Event");
    const pipe = new ActivitiesPipe(input.data, [normEvent]);
    let result = await pipe.run();
    assert.deepEqual(result[0].data.activity, outputActivity);
  });

  it('should extract more activities from description', async function(){
    cache.activities = {};
    const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));
    const inputActivity = [
      {
        "@type": "Concept",
        "prefLabel": "Ambling along"
      }
    ];
    const outputActivity = [
      {
        "@type": "Concept",
        "prefLabel": "Ambling along"
      },
      {
        "@id": "https://openactive.io/activity-list#72ddb2dc-7d75-424e-880a-d90eabe91381",
        "@type": "Concept",
        "prefLabel": "Running",
        "inScheme": "https://openactive.io/activity-list"
      }
    ];
    input.data.activity = [...inputActivity];
    const normEvent = new NormalisedEvent(input.data, "Event");
    const pipe = new ActivitiesPipe(input.data, [normEvent]);
    let result = await pipe.run();
    assert.deepEqual(result[0].data.activity, outputActivity);
  });

  it('should get broader and extract activities from name', async function(){
    cache.activities = {};
    const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));
    delete input.data.activity;
    const outputActivity = [
      {
        "@id": "https://openactive.io/activity-list#90346371-03e3-47c8-a25d-07e976b4a4c8",
        "@type": "Concept",
        "prefLabel": "Fell Running",
        "inScheme": "https://openactive.io/activity-list"
      },
      {
        "@id": "https://openactive.io/activity-list#72ddb2dc-7d75-424e-880a-d90eabe91381",
        "@type": "Concept",
        "prefLabel": "Running",
        "inScheme": "https://openactive.io/activity-list"
      }
    ];
    input.data.name = "Fell running with Tom";
    input.data.description = "asdf!";
    const normEvent = new NormalisedEvent(input.data, "Event");
    const pipe = new ActivitiesPipe(input.data, [normEvent]);
    let result = await pipe.run();
    assert.deepEqual(result[0].data.activity, outputActivity);
  });

  it('should get broader and keep non-OA activities', async function(){
    cache.activities = {};
    const input = await Utils.readJson(path.resolve(path.resolve(), './test/fixtures/event-normalised.json'));
    const inputActivity = [
      {
        "@type": "Concept",
        "prefLabel": "Ambling along"
      },
      {
        "id": "https://openactive.io/activity-list#90346371-03e3-47c8-a25d-07e976b4a4c8",
        "prefLabel": "Fell Running"
      }
    ];
    const outputActivity = [
      {
        "@type": "Concept",
        "prefLabel": "Ambling along"
      },
      {
        "@id": "https://openactive.io/activity-list#90346371-03e3-47c8-a25d-07e976b4a4c8",
        "@type": "Concept",
        "prefLabel": "Fell Running",
        "inScheme": "https://openactive.io/activity-list"
      },
      {
        "@id": "https://openactive.io/activity-list#72ddb2dc-7d75-424e-880a-d90eabe91381",
        "@type": "Concept",
        "prefLabel": "Running",
        "inScheme": "https://openactive.io/activity-list"
      }
    ];
    input.data.description = "asdf!";
    input.data.activity = [...inputActivity];
    const normEvent = new NormalisedEvent(input.data, "Event");
    const pipe = new ActivitiesPipe(input.data, [normEvent]);
    let result = await pipe.run();
    assert.deepEqual(result[0].data.activity, outputActivity);
  });

});