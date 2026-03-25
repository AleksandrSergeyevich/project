import { translations } from "./translations.js";
import {
  optionsDownload,
  optionsTime,
  optionsWeeks,
  contentDate,
  commentsDate,
  formatDate,
  apllyDateOffset,
} from "./utils.js";

let countryMinutesCommentsForTimeComment = 0;
let countryMinutesCommentsForTimeCommentAnswer = 0;
let countryMinutesCommentsForDate = 0;
let countryMinutesCommentsAnswerForDate = 0;
let number = 0;
let callCountComments = 0;
let callCount = 0;
let totalComments = 0;
let lastHoursAgoNumber = 0;
let lastAnswerMinutes = 0;
let earliestCommentMinutes = 0;
let usedMinutes = new Set();

export const datePublicArticle = (e, format) => {
  const fullday = parseInt(e || -1) * 24 + 24;
  return contentDate(fullday, optionsDownload, format);
};

export const dayOfWeek = (e, format) => {
  const fullday = parseInt(e || 0) * 24 + 24;
  return contentDate(fullday, optionsWeeks, format);
};

export const timePublicArticle = (e, format) => {
  const colonIndex = contentDate(parseInt(e), optionsTime, format).indexOf(":");
  return " " + contentDate(parseInt(e), optionsTime, format).slice(colonIndex - 2);
};


export const datePublicComment = (format) => {
  countryMinutesCommentsForDate -= 40;
  countryMinutesCommentsAnswerForDate = countryMinutesCommentsForDate;

  return commentsDate(countryMinutesCommentsForDate, optionsDownload, format).slice(0, 10);
};

export const dateAnswerPublicComment = (format) => {
  countryMinutesCommentsAnswerForDate += 20;

  return commentsDate(countryMinutesCommentsForDate, optionsDownload, format).slice(0, 10);
};

let hoursCount = 1;

export const counterComments = () => {
  if (callCountComments === 0) {
    const commentElements = document.querySelectorAll('[data-time-function="timeHoursAgo"]');
    totalComments = commentElements.length || 10;
  }

  if (callCountComments < 4) {
    number += 0.2;
    number = parseFloat(number.toFixed(1));
  } else {
    let segment = Math.ceil((totalComments - 4) / 8);
    let position = callCountComments - 4;
    let hourValue = Math.min(7, Math.max(1, Math.ceil(position / segment)));

    hoursCount = hourValue;
    number = hoursCount;
  }

  callCountComments += 1;
  return number;
};

export const incrementAndCheck = () => {
  callCount += 1;
  counterComments();
};

export const updatedTextComment = (id) => {
  incrementAndCheck();
  const numberPattern = /\d+/;
  const numberMapping = { 0.2: 7, 0.4: 24, 0.6: 36, 0.8: 52 };
  const replacementValue = numberMapping[number] || number;

  lastHoursAgoNumber = number;

  if (number < 1) {
    lastAnswerMinutes = numberMapping[number] || Math.round(number * 60);
    usedMinutes.add(lastAnswerMinutes);

    if (earliestCommentMinutes === 0 || lastAnswerMinutes < earliestCommentMinutes) {
      earliestCommentMinutes = lastAnswerMinutes;
    }
  } else {
    lastAnswerMinutes = 0;
    usedMinutes.clear();
    earliestCommentMinutes = 60;
  }

  let selectedTextKey;

  if (number < 1) {
    selectedTextKey = "minutesText";
  } else if (number === 1) {
    selectedTextKey = "oneHourText";
  } else {
    selectedTextKey = "twoHoursText";
  }

  const country = translations.find((country) => country.id === id);

  if (country) {
    const updatedText = country[selectedTextKey].replace(numberPattern, replacementValue);
    return `<span id="${country.id}">
		  <span>${updatedText}</span>
		</span>`;
  }
};

export const updatedTextCommentAnswer = (id) => {
  const numberPattern = /\d+/;
  let replacementValue;

  const minStep = 3;
  const maxStep = 10;

  const maxPossibleValue = Math.max(3, earliestCommentMinutes - 1);

  if (lastAnswerMinutes === 0) {
    const firstRandomStep = Math.floor(Math.random() * 8) + 1;
    replacementValue = Math.max(3, maxPossibleValue - firstRandomStep);
  } else {
    const randomStep = Math.floor(Math.random() * (maxStep - minStep + 1)) + minStep;
    replacementValue = Math.max(2, lastAnswerMinutes - randomStep);
  }

  if (usedMinutes.has(replacementValue) && replacementValue > 2) {
    let found = false;

    for (let i = replacementValue - 1; i >= 2; i--) {
      if (!usedMinutes.has(i)) {
        replacementValue = i;
        found = true;
        break;
      }
    }

    if (!found) {
      replacementValue = 2;
    }
  }

  usedMinutes.add(replacementValue);
  lastAnswerMinutes = replacementValue;

  let selectedTextKey = "minutesText";

  const country = translations.find((country) => country.id === id);

  if (country) {
    const updatedText = country[selectedTextKey].replace(numberPattern, replacementValue);
    return `<span id="${country.id}">
			<span>${updatedText}</span>
		  </span>`;
  }
};

export const timeHoursAgo = (id) => {
  id = id.substring(0, id.lastIndexOf('-'));
  return updatedTextComment(id);
};

export const timeAnswerHoursAgo = (id) => {
  id = id.substring(0, id.lastIndexOf('-'));
  return updatedTextCommentAnswer(id);
};

export const timePublicComment = (format) => {
  countryMinutesCommentsForTimeComment -= 40;
  countryMinutesCommentsForTimeCommentAnswer = countryMinutesCommentsForTimeComment;
  const colonIndex = commentsDate(countryMinutesCommentsForTimeComment, optionsTime, format).indexOf(":");
  return (
    " " + commentsDate(countryMinutesCommentsForTimeComment, optionsTime, format).slice(colonIndex - 2)
  );
};

export const timeAnswerPublicComment = (format) => {
  countryMinutesCommentsForTimeCommentAnswer += 20;
  const colonIndex = commentsDate(countryMinutesCommentsForTimeCommentAnswer, optionsTime, format).indexOf(":");

  return (
    " " + commentsDate(countryMinutesCommentsForTimeCommentAnswer, optionsTime, format).slice(colonIndex - 2)
  );
};

export const dateMonthText = (offset = 0, locale = null, monthType = "long") => {
  let date = new Date();

  const newDate = apllyDateOffset(date, offset);

  return formatDate(newDate, locale, monthType);
};

export const timeDay = (offset = 0, locale = null) => {
  let date = new Date();

  const newDate = apllyDateOffset(date, offset);

  return newDate.toLocaleString(locale || dateLocaleCode, { day: "numeric" });
};

export const timeMonth = (offset = 0, locale = null, monthType = "long") => {
  let date = new Date();

  const newDate = apllyDateOffset(date, offset);

  return newDate.toLocaleString(locale || dateLocaleCode, { month: monthType });
};

export const timeYear = (offset = 0, locale = null) => {
  let date = new Date();

  const newDate = apllyDateOffset(date, offset);

  return newDate.toLocaleString(locale || dateLocaleCode, { year: "numeric" });
};

const elements = document.querySelectorAll("[data-time-function]");
const functions = {
  datePublicArticle: (val, format) => datePublicArticle(val, format),
  timePublicArticle: (val, format) => timePublicArticle(val, format),
  datePublicCheck: (val, format) => datePublicArticle(-3, format),
  dateRegistr: (val, format) => datePublicArticle(1, format),
  dayOfWeek: (val, format) => dayOfWeek(val, format),
  dateLongMonthText: (val, format) => dateMonthText(val, format, "long"),
  dateShortMonthText: (val, format) => dateMonthText(val, format, "short"),
  datePublicComment: (val, format) => datePublicComment(format),
  timePublicComment: (val, format) => timePublicComment(format),
  dateAnswerPublicComment: (val, format) => dateAnswerPublicComment(format),
  timeAnswerPublicComment: (val, format) => timeAnswerPublicComment(format),
  timeHoursAgo: (val, format) => timeHoursAgo(val || format),
  timeAnswerHoursAgo: (val, format) => timeAnswerHoursAgo(val || format),
  timeYear: (val, format) => timeYear(val, format),
  timeDay: (val, format) => timeDay(val, format),
  timeMonth: (val, format) => timeMonth(val, format),
};

for (let i = 0; i < elements.length; i++) {
  const value = elements[i].getAttribute("data-time-value") || 0;
  const funcValue = elements[i].getAttribute("data-time-function");
  const formatValue = elements[i].getAttribute("data-time-format") || dateLocaleCode;

  elements[i].innerHTML = functions[funcValue](value, formatValue);
}