export const formatMonth = (date: Date) => {
  return `Tháng ${date.getMonth() + 1} ${date.getFullYear()}`;
};

export const getNextWeekMonday = () => {
  const today = new Date();

  // getDay(): 0 (CN) → 6 (T7)
  const currentDay = today.getDay();

  // Convert về ISO (T2 = 1 ... CN = 7)
  const isoDay = currentDay === 0 ? 7 : currentDay;

  // Lùi về Thứ 2 tuần hiện tại
  const mondayThisWeek = new Date(today);
  mondayThisWeek.setDate(today.getDate() - (isoDay - 1));

  // +7 ngày → tuần kế tiếp
  const mondayNextWeek = new Date(mondayThisWeek);
  mondayNextWeek.setDate(mondayThisWeek.getDate() + 7);

  return mondayNextWeek.toISOString().split("T")[0];
};
