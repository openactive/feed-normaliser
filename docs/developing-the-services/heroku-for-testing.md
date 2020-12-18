# Dev hosting on Heroku

You can [test fully on a local machine using a Docker setup](docker-for-dev.md), but there may be times that isn't suitable. FOr example, you may want to share the server with others, or test something about our production environment.

In these cases, you can set up a testing environment on Heroku, just the same as but separate from our production one.

To do so, just create a new app and set up the testing environment you need there; Heroku doesn't have the concept of a dev instance of a live app.

Therefore [follow the instructions for Heroku for production](../running-the-services/heroku-for-production.md) with one change:

* Where it tells you to deploy your code, make sure you deploy your working branch instead of the "master" branch.

