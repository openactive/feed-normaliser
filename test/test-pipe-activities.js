import assert from 'assert';
import { cache } from '../src/lib/utils.js';
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
    cache.activities = {
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
    cache.activities = {
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
  it('should get labels for activities broader in the heirarcy', function(){
    cache.activities = {
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
    assert.equal(result[0], "Small Sided Football");
    assert.equal(result[1], "Football");
  });
});
