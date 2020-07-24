import RRule from 'rrule';
import { parse as parseDuration, end } from '../iso8601-duration/index.js';

import Pipe from './pipe.js';
import Utils from '../utils.js';
import Settings from '../settings.js';
import NormalisedEvent from '../normalised-event.js';

// Normalises an opportunity data object of any type with the `eventSchedule` property
class NormaliseSchedulePipe extends Pipe {
  run(){

    return new Promise(async resolve => {

        let id = this.getId();
        let type = this.getType();
        let kind = this.getKind();
        console.log(`Running ${id} (${type}) through ${this.constructor.name}`);

        if(typeof this.rawData.eventSchedule !== 'undefined'){
            this.doCleanup();
            // There is a schedule, we need to parse it out into events.
            let {eventSchedule, ...parent} = this.rawData;

            for (let schedule of eventSchedule){

                let childKind;
                if(kind == "CourseInstance" || kind == "Course"){
                    childKind = "CourseInstanceSubEvent";
                }else if(typeof schedule.scheduledEventType !== 'undefined'){
                    childKind = schedule.scheduledEventType;
                }else{
                    childKind = kind;
                }

                // Get schedule properties that will carry over to the generated events
                let eventDataBase = {...parent};
                delete eventDataBase["@id"];
                eventDataBase["@type"] = schedule.scheduledEventType ? schedule.scheduledEventType : childKind;
                eventDataBase.duration = schedule.duration;
                eventDataBase.startDate = schedule.startDate;
                eventDataBase.endDate = schedule.endDate;
                eventDataBase.startTime = schedule.startTime;
                eventDataBase.endTime = schedule.endTime;

                // Get schedule properties used to calculate the series
                try{
                    let {freq, interval} = this.freq(schedule);
                    let byDay = this.byWeekDay(schedule);
                    let byMonth = this.byMonth(schedule);
                    let byMonthDay = this.byMonthDay(schedule);
                    let dtStart = this.dtStart(schedule);
                    let until = this.until(schedule);
                    let count = this.count(schedule);

                    let rruleOptions = {freq: freq, interval: interval}; // this is the only required one
                    if(typeof(byDay) !== 'undefined'){
                        rruleOptions.byweekday = byDay;
                    }
                    if(typeof(byMonth) !== 'undefined'){
                        rruleOptions.bymonth = byMonth;
                    }
                    if(typeof(byMonthDay) !== 'undefined'){
                        rruleOptions.bymonthday = byMonthDay;
                    }
                    if(typeof(dtStart) !== 'undefined'){
                        rruleOptions.dtstart = dtStart;
                    }
                    if(typeof(until) !== 'undefined'){
                        rruleOptions.until = until;
                    }
                    if(typeof(count) !== 'undefined'){
                        rruleOptions.count = count;
                    }

                    const rruleSet = new RRule.RRuleSet();
                    const rule = new RRule.RRule(rruleOptions);
                    rruleSet.rrule(rule);

                    // Add dates to exclude if present
                    // TODO: this only excludes exact matches, including time.
                    //       It should also let input be yyyy-mm-dd and exclude any events that
                    //       start in that 24 hour period.
                    if(schedule.exceptDate != undefined){
                        const exceptDates = Utils.ensureArray(schedule.exceptDate);
                        for(let exDate of exceptDates){
                            rruleSet.exdate(new Date(exDate));
                        }
                    }

                    // Only generate events two weeks from NOW (or until schedule ends, whichever is sooner)
                    // aka this does not generates events that would have start dates in the past.
                    let occurrences = rruleSet.between(this.eventsFrom(), this.eventsUntil(until));
                    console.log(`Generating events ${rule.toText()} (${occurrences.length} occurrences between ${this.eventsFrom()} and  ${this.eventsUntil(until)})`);

                    if(occurrences.length > 0){
                        // Generate a NormalisedEvent for every occurrence date generated
                        for(let occurrenceDate of occurrences){
                            let eventData = {...eventDataBase};
                            eventData.startDate = occurrenceDate.toISOString();
                            eventData.endDate = this.calculateEndDate(occurrenceDate, schedule.endTime, schedule.duration).toISOString();
                            // TODO idTemplate and urlTemplate
                            let normalisedEvent = new NormalisedEvent(eventData, childKind);
                            this.normalisedEvents.push(normalisedEvent);
                        }

                    }
                }catch(error){
                    console.log(`Error generating schedule`);
                    console.log(error);
                    console.log(schedule);
                }
            }
        }

        resolve(this.normalisedEvents);
    });
  }

  schemaDaytoRRuleDay(schemaDay){
    // Could be a schema.org day or an iCal string day
    // Some publishers use http and some use https for schema org so not doing exact matches
    if(schemaDay.includes("schema.org/Monday") || schemaDay == "MO"){
        return RRule.RRule.MO;
    }
    if(schemaDay.includes("schema.org/Tuesday") || schemaDay == "TU"){
        return RRule.RRule.TU;
    }
    if(schemaDay.includes("schema.org/Wednesday") || schemaDay == "WE"){
        return RRule.RRule.WE;
    }
    if(schemaDay.includes("schema.org/Thursday") || schemaDay == "TH"){
        return RRule.RRule.TH;
    }
    if(schemaDay.includes("schema.org/Friday") || schemaDay == "FR"){
        return RRule.RRule.FR;
    }
    if(schemaDay.includes("schema.org/Saturday") || schemaDay == "SA"){
        return RRule.RRule.SA;
    }
    if(schemaDay.includes("schema.org/Sunday") || schemaDay == "SU"){
        return RRule.RRule.SU;
    }
  }

  makeDate(dateString, timeString){
    let fullString = dateString;
    if (typeof timeString !== 'undefined'){
        fullString = fullString + "T" + timeString;
    }
    return new Date(fullString);
  }

  byWeekDay(schedule){
    if (typeof schedule.byDay !== 'undefined'){
        let weekDays = [];
        for(let day of schedule.byDay){
            weekDays.push(this.schemaDaytoRRuleDay(day));
        }
        return weekDays;
    }
  }

  byMonth(schedule){
    return schedule.byMonth;
  }

  byMonthDay(schedule){
    return schedule.byMonthDay;
  }

  dtStart(schedule){
    return this.makeDate(schedule.startDate, schedule.startTime);
  }

  until(schedule){
    if(typeof schedule.endDate !== 'undefined'){
        return this.makeDate(schedule.endDate, schedule.endTime);
    }
  }

  freq(schedule){
    try{
        let frequency = parseDuration(schedule.repeatFrequency);
        // Making some sweeping assumptions about value here,
        // eg. that only one of the periods will be set: only day, or only month, etc
        // Doesn't bother with minutes or seconds
        // Returns {frequency, interval}
        // Returns interval 1 by default except in special cases
        if(frequency.hours == 1){
            return {freq: RRule.RRule.HOURLY, interval: 1};
        }
        if(frequency.days == 1 || frequency.hours == 24){
            return {freq: RRule.RRule.DAILY, interval: 1};
        }
        if(frequency.weeks == 1 || frequency.days == 7){
            return {freq: RRule.RRule.WEEKLY, interval: 1};
        }
        if(frequency.weeks == 2 || frequency.days == 14){
            return {freq: RRule.RRule.WEEKLY, interval: 2};
        }
        if(frequency.months == 1){
            return {freq: RRule.RRule.MONTHLY, interval: 1};
        }
        if(frequency.years == 1 || frequency.months == 12){
            return {freq: RRule.RRule.YEARLY, interval: 1};
        }
    }catch(error){
        console.log(`Warning: could not parse repeatFrequency [${schedule.repeatFrequency}]`);
        console.log(`Therefore guessing repeat frequency from byDay..`);
        // console.log(error);

        if(schedule.byDay != undefined && schedule.byDay.length > 0){
            // This is a hack to accommodate a common non-conformant practice of using byDay
            // to indicate weekly repetition.
            return {freq: RRule.RRule.WEEKLY, interval: 1};
        }
    }
  }

  count(schedule){
    return schedule.repeatCount;
  }

  eventsUntil(until){
    // Generate events until two weeks from now, or until the end date,
    // whichever is sooner.
    let futureDate = new Date(Date.now() + Settings.scheduleEventsTimeSpan);
    if(typeof until !== 'undefined'){
        if(futureDate <= until){
            return futureDate;
        }else{
            return until;
        }
    }else{
        return futureDate;
    }
  }

  eventsFrom(){
    // Should this return the schedule start date instead,
    // if it's in the future?
    return new Date(Date.now());
  }

  calculateEndDate(occurrenceDateStr, endTime, duration){
    let occurrenceDate = new Date(occurrenceDateStr);
    let endDate = occurrenceDate;
    if(typeof duration !== 'undefined'){
        // use duration and start time to work out the end time.
        endDate = end(parseDuration(duration), occurrenceDate);
    }else
    if(typeof endTime !== 'undefined'){
        // assume it's on the same day because if there's no duration what else can we do
        // DO NOT use endDate for this because it's supposed to be the end date of the
        // schedule, not any specific event.
        let time = endTime.split(":");
        endDate.setHours(time[0]);
        endDate.setMinutes(time[1]);
    }
    return endDate;
  }
}

export default NormaliseSchedulePipe;