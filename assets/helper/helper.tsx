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
