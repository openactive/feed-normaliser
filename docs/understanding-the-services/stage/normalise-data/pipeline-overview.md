# Normalisation Overview

The 'pipeline' consists of several 'pipes' which are run in turn. The pipeline is initialised with an empty array called `normalisedData`. Each object from the `raw_data` table is passed into each pipe. Each pipe also has access to the `normalisedData` array, and if the pipe is able to generate a normalised event from the input data, the normalised event is added to this array. Pipes may also edit or remove data from this array.

## Configuring the pipeline

The order of the pipes can be configured in `src/lib/pipes/index.js`. They are run in the order in this file, from top to bottom, so to change the order simply move a pipe up or down the list.

Similarly, to disable a pipe, you can comment it out in this list.

When adding new pipes, don't forget to import them from their respective files.

## Types of pipes

There are three kinds of pipes:

* [Normalisation pipes](normalisation-pipes.md)
* Cleanup pipes
* Enhancement pipes

