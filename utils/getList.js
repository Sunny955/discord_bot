const getList = function (day) {
  const daysOfWeek = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };

  return daysOfWeek[day.toLowerCase()] ?? -1;
};

module.exports = getList;
