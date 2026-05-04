export const formatMonth = (date: Date) => {
  return `Tháng ${date.getMonth() + 1} ${date.getFullYear()}`;
};

export const getNextWeekMonday = () => {
  const today = new Date();

  const currentDay = today.getDay();
  const isoDay = currentDay === 0 ? 7 : currentDay;

  const mondayThisWeek = new Date(today);
  mondayThisWeek.setDate(today.getDate() - (isoDay - 1));

  const mondayNextWeek = new Date(mondayThisWeek);
  mondayNextWeek.setDate(mondayThisWeek.getDate() + 7);

  // format yyyy-mm-dd theo local
  const year = mondayNextWeek.getFullYear();
  const month = String(mondayNextWeek.getMonth() + 1).padStart(2, "0");
  const day = String(mondayNextWeek.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
