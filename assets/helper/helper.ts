/**
 * Get current date in format yyyy-mm-ddThh:mm
 *
 * @return {string} date in format yyyy-mm-ddThh:mm
 */
export const getCurrentDate = (): string => {
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const now = new Date();

  const year = now.getFullYear().toString();
  const month = months[now.getMonth()];
  var day = now.getDate().toString();
  if (day.length < 2) {
    day = "0" + day;
  }
  var hour = now.getHours().toString();
  if (hour.length < 2) {
    hour = "0" + hour;
  }
  var min = now.getMinutes().toString();
  if (min.length < 2) {
    min = "0" + min;
  }
  const date = year + "-" + month + "-" + day + "T" + hour + ":" + min;

  return date;
};

export const formatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Convert date returned from database (in this case from prisma datetime)
 *
 * @param {string} inputDate String from database
 * @return {string} date in format dd-Mmm-yyyy so it's easy for user to interpret
 */
export const displayDate = (inputDate: string): string => {
  const dateObj = new Date(inputDate);
  const date = dateObj.getDate().toString();
  const month = dateObj.getMonth();
  var monthString;
  switch (month) {
    case 1:
      monthString = "Jan";
      break;
    case 2:
      monthString = "Feb";
      break;
    case 3:
      monthString = "Mar";
      break;
    case 4:
      monthString = "Apr";
      break;
    case 5:
      monthString = "May";
    case 6:
      monthString = "Jun";
      break;
    case 7:
      monthString = "Jul";
      break;
    case 8:
      monthString = "Aug";
      break;
    case 9:
      monthString = "Sep";
      break;
    case 10:
      monthString = "Oct";
      break;
    case 11:
      monthString = "Nov";
      break;
    case 12:
      monthString = "Dec";
      break;
  }
  const year = dateObj.getFullYear().toString();

  return date + "-" + monthString + "-" + year;
};

/**
 * Convert date returned from database (in this case from prisma datetime)
 *
 * @param {string} dateFromDatabase String from database
 * @return {string} date in format yyyy-mm-ddThh:mm
 */
export const getDate = (dateFromDatabase: string): string => {
  const now = new Date(dateFromDatabase);

  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  const year = now.getFullYear().toString();
  const month = months[now.getMonth()];
  var day = now.getDate().toString();
  if (day.length < 2) {
    day = "0" + day;
  }
  var hour = now.getHours().toString();
  if (hour.length < 2) {
    hour = "0" + hour;
  }
  var min = now.getMinutes().toString();
  if (min.length < 2) {
    min = "0" + min;
  }
  const date = year + "-" + month + "-" + day + "T" + hour + ":" + min;

  return date;
};

/**
 * Change first letter of string (word/sentence) into capital letter
 *
 * @param {string} sourceStr string to be changed
 * @return {string} result in capitalized first character of string (hero -> Hero)
 */
export const displayCapitalFirst = (sourceStr: string) => {
  const firstLetter = sourceStr.charAt(0).toUpperCase();
  const theRest = sourceStr.slice(1, sourceStr.length);

  return firstLetter + theRest;
};

/**
 * Translate transaction source 'code' into text to be displayed to end-user
 *
 * @param {string} trxSourceCode transaction source 'code' (e.g. invt, sale, etc..).
 * @return {string} string to be displayed to end user corresponding to transaction source 'code' (Inventory, Sales, etc..).
 */
export const decodeTransactionSource = (trxSourceCode: string): string => {
  switch (trxSourceCode) {
    case "invt":
      return "Inventory";
    case "sale":
      return "Sales";
    default:
      return "";
  }
};
