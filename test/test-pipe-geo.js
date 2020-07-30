import assert from 'assert';
import { cache } from '../src/lib/utils.js';
import GeoPipe from '../src/lib/pipes/geo-pipe.js';
import NormalisedEvent from '../src/lib/normalised-event.js';



describe('geo-enhancement', function() {
    it('should leave the data unchanged if no location', async function() {
        const data = {"id": "event1", "kind": "Event",
            "data": {
            "@context": ["https://openactive.io/"],
            "@id": "https://example.org/event",
            "@type": "Event",
            "name": "An event",
            "startDate": "2020-06-02T15:32:00Z"
        }};
        const norm = new NormalisedEvent(data.data, "Event");
        let pipe = new GeoPipe(data, [norm]);
        let result = await pipe.run();
        assert.equal(result.length, 1);
        assert.deepEqual(result[0].data,data.data);
    });

    it('should leave the data unchanged if no postcode', async function() {
        const data = {"id": "event1", "kind": "Event",
            "data": {
            "@context": ["https://openactive.io/"],
            "@id": "https://example.org/event",
            "@type": "Event",
            "name": "An event",
            "startDate": "2020-06-02T15:32:00Z",
            "location": {
                "@id": "https://goteamup.com/api/openactive/v1/id/place/10739",
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 53.1654998,
                  "longitude": -2.2045996
                }
            }
        }};
        const norm = new NormalisedEvent(data.data, "Event");
        let pipe = new GeoPipe(data, [norm]);
        let result = await pipe.run();
        assert.equal(result.length, 1);
        assert.deepEqual(result[0].data,data.data);
    });

    it('should get geo data from cache the second time', async function() {
        const inputLoc = {
          "location": {
            "@type": "Place",
            "url": "http://www.better.org.uk/leisure-centre/banes/bath-sports-and-leisure-centre",
            "name": "Bath Sports and Leisure Centre",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "North Parade Road",
                "postalCode": "BA2 4ET"
            }
          }
        };
        const input1 = {
            "id": "event1", "kind": "Event",
            "data": {
              "@context": ["https://openactive.io/"],
              "@type": "Event",
              "name": "Event 1",
              ...inputLoc
            }
        };
        const input2 = {
            "id": "event2", "kind": "Event",
            "data": {
              "@context": ["https://openactive.io/"],
              "@type": "Event",
              "name": "Event 2",
              ...inputLoc
            }
        };

        const outputLoc = {
          "location": {
            "@type": "Place",
            "url": "http://www.better.org.uk/leisure-centre/banes/bath-sports-and-leisure-centre",
            "name": "Bath Sports and Leisure Centre",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "North Parade Road",
                "addressLocality": "Bath and North East Somerset",
                "addressRegion": "South West",
                "postalCode": "BA2 4ET",
                "addressCountry": "England"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 51.381502,
              "longitude": -2.35433
            }
          }
        };
        const output1 = {
            "id": "event1", "kind": "Event",
            "data": {
              "@context": ["https://openactive.io/"],
              "@type": "Event",
              "name": "Event 1",
              ...outputLoc
            }
        };
        const output2 = {
            "id": "event2", "kind": "Event",
            "data": {
              "@context": ["https://openactive.io/"],
              "@type": "Event",
              "name": "Event 2",
              ...outputLoc
            }
        };

        const norm1 = new NormalisedEvent(input1.data, "Event");
        const norm2 = new NormalisedEvent(input2.data, "Event");
        assert.equal(typeof cache.postcodes["BA2 4ET"], "undefined");
        let pipe1 = new GeoPipe(input1, [norm1]);
        let result1 = await pipe1.run();
        assert.equal(typeof cache.postcodes["BA2 4ET"], "object");
        let pipe2 = new GeoPipe(input2, [norm2]);
        let result2 = await pipe2.run();

    });

    it('should add geo location info for a postcode', async function() {
        const input = {"id": "event1", "kind": "Event",
        "data": {
          "@context": ["https://openactive.io/"],
          "@type": "Event",
          "location": {
            "@type": "Place",
            "url": "http://www.better.org.uk/leisure-centre/banes/bath-sports-and-leisure-centre",
            "name": "Bath Sports and Leisure Centre",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "North Parade Road",
                "addressLocality": "Bath",
                "addressRegion": "Somerset",
                "postalCode": "BA2 4ET",
                "addressCountry": "GB"
            }
          }
        }};

        const output = {"id": "event1", "kind": "Event",
        "data": {
          "@context": ["https://openactive.io/"],
          "@type": "Event",
          "location": {
            "@type": "Place",
            "url": "http://www.better.org.uk/leisure-centre/banes/bath-sports-and-leisure-centre",
            "name": "Bath Sports and Leisure Centre",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "North Parade Road",
                "addressLocality": "Bath",
                "addressRegion": "Somerset",
                "postalCode": "BA2 4ET",
                "addressCountry": "GB"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 51.381502,
              "longitude": -2.35433
            }
          }
        }};

        const norm = new NormalisedEvent(input.data, "Event");
        let pipe = new GeoPipe(input, [norm]);
        let result = await pipe.run();
        assert.equal(result.length, 1);
        assert.deepEqual(result[0].data,output.data);
    });

    it('should add address info for a postcode', async function() {
        const input = {"id": "event1", "kind": "Event",
        "data": {
          "@context": ["https://openactive.io/"],
          "@type": "Event",
          "location": {
            "@type": "Place",
            "url": "http://www.better.org.uk/leisure-centre/banes/bath-sports-and-leisure-centre",
            "name": "Bath Sports and Leisure Centre",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "North Parade Road",
                "postalCode": "BA2 4ET"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 51.381502,
              "longitude": -2.35433
            }
          }
        }};

        const output = {"id": "event1", "kind": "Event",
        "data": {
          "@context": ["https://openactive.io/"],
          "@type": "Event",
          "location": {
            "@type": "Place",
            "url": "http://www.better.org.uk/leisure-centre/banes/bath-sports-and-leisure-centre",
            "name": "Bath Sports and Leisure Centre",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "North Parade Road",
                "addressLocality": "Bath and North East Somerset",
                "addressRegion": "South West",
                "postalCode": "BA2 4ET",
                "addressCountry": "England"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 51.381502,
              "longitude": -2.35433
            }
          }
        }};

        const norm = new NormalisedEvent(input.data, "Event");
        let pipe = new GeoPipe(input, [norm]);
        let result = await pipe.run();
        assert.equal(result.length, 1);
        assert.deepEqual(result[0].data,output.data);
    });

});
