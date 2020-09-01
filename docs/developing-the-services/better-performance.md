# Better Performance

The system has to process a lot of data through several different processes, 
and this document discusses way this could be sped up in the future.

Currently the system on Heroku is designed to run one worker dyno only. 
If more than one is run it won't actually help because both will try and do the same tasks.

## What are you optomising for?

Are you optomising for:

* The total time it takes to process all data in the system? ("Total Time")
* The time it takes from when a publisher publishes a new bit of data and we notice, download it and fully process it? ("Time from publish to processed")

Note that these may require different strategies. If the latter, we'd suggest jumping straight to a message que.

## Increase specs of worker dyno

A "Standard 2X" dyno or higher may help.

Cons:
* This strategy in itself does not take advantage of Node event loop.
* In heroku, there is a setting to say how many dyno's of a particular worker type should be run. This can't be used and must remain at 1.

## Run processes together in one worker

The `src/bin/heroku.js` script that calls each stage (ie `spider()`, `download_raw_all_publisher_feeds()`, etc) uses `await` so they run one after the other.
This means an earlier stage has to finish before a new one starts.

Instead, remove all the `awaits` so each stage runs at once. 

Pros: 
* Should make the "Total Time" metric better.

Cons:
* This may make the "Time from publish to processed" metric worse, as it will take longer for the system to notice that work can be done as a bit of data progresses through the system.
* In heroku, there is a setting to say how many dyno's of a particular worker type should be run. This can't be used and must remain at 1.

## Run more than one worker

It's easy in Heroku to run more than one worker dyno, but if you do you need to ensure the work is divided up by worker dyno. 
There are several strategies to do this.

### Divide by stage

There are currently 6 stages. An easy way to divide is by stage.

* Create 6 different `src/bin/heroku.js` scripts, each of which calls 1 stage only. (ie `src/bin/heroku-spider-data-catalog.js`, `src/bin/heroku-download-raw.js`, etc)
* Edit `Procfile` and set up a row for each script with a different worker name. Eg:

```
web: node ./src/bin/web-server.js
worker-spider-data-catalog: node ./src/bin/heroku-spider-data-catalog.js
worker-download-raw: node ./src/bin/heroku-download-raw.js
etc
```
    
Pros:

* This let's you adjust dyno size per process. 
  For instance, the Spider Data Catalog stage needs minimal resources and does very little work and can run on the cheapest Dyno specs. 
  But something like the Normalise Data stage may benefit from being run on a better performance dyno.

Cons:

* In heroku, there is a setting to say how many dyno's of a particular worker type should be run. This can't be used and must remain at 1.
* The number of worker dynos is locked to the number of stages. This is very inflexible.
* You'll end up running a worker dynos just to Spider the Data Catalog, which will be sitting idle most of the time. 
  Consider merging the Spider the Data Catalog and the Download Raw data stage into one Dyno, maybe?

### Have stages do several things at once

Currently many stages only process one bit of data at a time.

eg:

* Normalise data
* Validate raw data
* Profile normalised data

(On some stages external factors mean this can not be improved; because of the next URL's in RPDE API's, it's only possible to 
download raw data one page at a time.)

These stages load the next batch of work, do it, then repeat. 
In the same Dyno, several batches of work could be run at once, and thus while the Dyno is waiting for the database to return 
something for one batch it could be doing the CPU work for another batch. (ie Take full advantage of Node's event loop)

The only issue here is to make sure that different batches of work are done. 

One way is a new environmental and settings variable - something  like `numberOfWorkersNormaliseData`.
When starting this stage, a number of function calls without `await` are made. Each one is passed the total number of workers and which one it is. 
To make sure that each worker processes different data, when looking for work to do it can check something like `ID % total = number`

Pros:

* Gives you flexibility to balance the worker Dyno specifications and number of tasks it does

Cons:

* In heroku, there is a setting to say how many dyno's of a particular worker type should be run. This can't be used and must remain at 1.
* While this may process data faster, the system may still be slow to realise new data has arrived that it should process

### Add a message que

Adding a message que would involve much more refactoring, but provides a very neat and flexible solution.

This system would essentially involve 3 new components:

* A "Trigger" component: Something to run the "Spider Data Catalog stage" stage on a cron sytem. This could be a worker by itself, or some external system. 
  In any case, when a publisher record has been updated, a message should be sent to the message que asking the worker to get raw data from that publisher.
* A message que. Ones that Heroku provides are good first ones to consider.
* A "Workers" component: Dyno Nodes run a workers that take messages from the que and do the work. After each data is processing, new messages are generated for more work. Eg
    * After a piece of raw data is downloaded from a publisher, messages are generated to:
        * Validate it
        * Normalise it
    * After a piece of normalised data is saved, messages are generated to:
        * Profile it

Considerations: 
* You may see one stage as more important than other stages. 
  If so, you may want different ques for different types of messages. 
  Alternatively, you may be using a message que system that allows setting importance on messages.
* One worker dyno can run several workers, and thus take advantage of Node's event loop.

Pros:
* In heroku, there is a setting to say how many dyno's of a particular worker type should be run. 
  This can finally be used; it can be turned up when a system is first live or when important data is about to be published, than turned down for normal use.
  This provides easy flexibility.
* Easy monitoring of message ques to see how much work remains to be done; it may even be possible to use auto scale solutions here.
* This really helps with the "Time from publish to processed" metric.

Cons:
* More complex to set up
* Requires another service
* Be careful of backpressure problems; if a cron service generates messages asking to download raw data faster than raw data can be downloaded there may be issues.
  You don't want more than one worker to try and download a raw data source at the same time. 
  Consider if the download raw data stage should be handled in the "Trigger" component.

## Better database server

This system does a lot of database work.

On Heroku, check the level of package (and hence the cost). It may be an idea to turn this up.

Also note that any move to make the system process data faster may just mean that more work is being put on to the database server. 
Make sure the database server can handle more load.

## Publisher feed stats

These are cached. In all cases, consider the impact of changes on how often these caches are updated.

Also consider if there are easy ways that a worker can update a stat without having to fully recalculate it.

For instance, if a worker validates some raw data and it passes, and if the individual values used to calculate a percentage are stored as database columns, it could easily run:

    UPDATE publisher_feed 
    SET cached_raw_data_validated_total =  cached_raw_data_validated_total + 1, 
    cached_raw_data_passed_total = cached_raw_data_passed_total + 1 
    WHERE id=1


