// import TestPipe from './test-pipe.js';
import NormaliseEventPipe from './normalise-event-pipe.js';
import NormaliseSlotPipe from './normalise-slot-pipe.js';
import NormaliseSchedulePipe from './normalise-schedule-pipe.js';

export default [
  // Comment this out to see some test normalised events in the system
  //TestPipe
  NormaliseEventPipe,
  NormaliseSlotPipe,
  NormaliseSchedulePipe
];
