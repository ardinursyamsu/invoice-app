export const getCurrentDate = () => {
  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
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


export const displayDate = (inputDate: string) => {
  const dateObj = new Date(inputDate);
  const date = dateObj.getDate().toString();
  const month = dateObj.getMonth();
  var monthString;
  switch(month){
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


export const getDate = (dateFromDatabase: string) => {
  const now = new Date(dateFromDatabase);

  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
  
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