// import TestPipe from './test-pipe.js';
import NormaliseEventPipe from './normalise-event-pipe.js';
import NormaliseSlotPipe from './normalise-slot-pipe.js';
import NormaliseSchedulePipe from './normalise-schedule-pipe.js';
import GeoPipe from './geo-pipe.js';
import ActivitiesPipe from './activities-pipe.js';

export default [
  // Test pipe - uncomment for test events
  //TestPipe,
  // Normalisation pipes - don't turn these off except for testing
  NormaliseEventPipe,
  NormaliseSlotPipe,
  NormaliseSchedulePipe,
  // Data enhancement pipes - turn these on and off as needed
  GeoPipe,
  ActivitiesPipe
];
