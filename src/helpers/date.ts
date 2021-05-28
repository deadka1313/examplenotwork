import moment from 'moment-timezone';

export const getDateTime = (date: moment.Moment, time: moment.Moment, tz: string): string => {
  const newDate = moment(date).hours(moment(time).hours()).minutes(moment(time).minutes()).tz(tz);
  return newDate.format();
};

export const isPast = (d: string) => {
  const now = moment(moment().format('YYYY-MM-DD'));
  const date = moment(d);
  return now.diff(date, 'days') > 0;
};

const fromUTCOffsetToString = (offset: string): string =>
  `UTC${offset.split(':')[0].replace('+0', '+')}`;

export const getCurrentUTCTimezone = (): string => fromUTCOffsetToString(moment().format('Z'));

export const getUTCTimezoneFromName = (name: string): string =>
  fromUTCOffsetToString(moment.tz(name).format('Z'));
