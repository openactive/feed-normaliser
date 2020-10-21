# Data Pipeline

The conformance services pipeline has a series of stages. This page provides an overview; see the individual pages for each stage for details.

### [Spidering](spider-data-catalog.md)

The Spidering stage takes an [OpenActive Data Catalog](https://openactive.io/data-catalogs/) and follows the links, resulting in a list of URLs where OA feeds are to be found. The value is hard-coded for this project, but developers can change this if required for their application.

### [Harvesting](download-raw-data.md)

The Harvesting stage takes the list of URLs from the Spidering stage and downloads the contents of the feed from each one, storing the results in the database.

### [Validation](validate-raw-data.md)

The Validation stage compares the harvested data from each of the feeds against the[ OpenActive specification](https://openactive.io/modelling-opportunity-data/), and gives a yes/no answer for each item in the feed, recording any errors that were encountered.

### [Normalisation](normalise-data/)

The Normalisation stage takes the harvested data and transforms it into conformant, normalised OpenActive data, according to a fixed set of patterns. This allows data from sources that publish conformant data in different ways to be used together.

### [Profiling](profile-normalised-data.md)

The Profiling stage compares the normalised data against the [OpenActive Profiles](https://github.com/openactive/conformance-profiles) and reports on the degree to which each item matches the profile

### [Republication](http-apis.md)

The republication stage makes an RPDE feed of the normalised data available.

### Error Capture

Any errors encountered during processing of the data at any stage are stored in the database to aid with improvement efforts.

### [Feed stats generation](generated-stats.md)

The statistics on publisher feeds that can be generated
