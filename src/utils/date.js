export const getFormatDate = (date) => {
  // const today = new Date();
  // const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  const dateNum = new Date(date);
  const dd = dateNum.getDate();
  const mm = dateNum.getMonth() + 1;
  const yyyy = dateNum.getFullYear();
  let formatDate = yyyy + "-" + mm + "-" + dd;
  if (mm < 10) {
    formatDate = yyyy + "-0" + mm + "-" + dd;
  }
  return formatDate;
};
//
export const getTomorrow = (date) => {
  return new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000);
};
//input : 00:00
export const getSeconds = (time) => {
  const timeArray = time.split(":");
  return timeArray[0] * 3600 + timeArray[1] * 60;
};

//根据活动日期及签到时间 提示用户
export const AttendanceTime = (
  startDate,
  endDate,
  startTime,
  endTime,
  attendenceDate
) => {
  const currentTime = new Date();
  const startTimeInSeconds = getSeconds(startTime);
  const endTimeInSeconds = getSeconds(endTime);
  //结束日期的后一天
  const endDateAfter = getTomorrow(endDate);
  //用户是否已经签到了
  const isAttended = attendenceDate.find(
    (a) => getFormatDate(a) === getFormatDate(new Date())
  );
  if (currentTime > new Date(startDate) && currentTime < endDateAfter) {
    const currentSeconds =
      currentTime.getHours() * 3600 +
      currentTime.getMinutes() * 60 +
      currentTime.getSeconds();
    if (currentSeconds < startTimeInSeconds) {
      // console.log("未开始");
      return { status: false, message: "活动未开始" };
    } else if (
      currentSeconds > startTimeInSeconds &&
      currentSeconds < endTimeInSeconds
    ) {
      if (isAttended) return { status: false, message: "已签到" };
      else {
        // console.log("可进入");
        return { status: true, message: "前往签到" };
      }
    } else {
      // console.log("签到已结束");
      return { status: false, message: "签到已结束" };
    }
  } else if (currentTime < new Date(startDate)) {
    // console.log("活动未开始");
    return { status: false, message: "活动未开始" };
  } else {
    // console.log("活动已结束");
    return { status: false, message: "活动已结束" };
  }

  // const
};

function parseDate(str) {
  var mdy = str.split("-");
  return new Date(mdy[0], mdy[1] - 1, mdy[2]);
}
export function daysBetweenTwo(first, second) {
  return Math.round(
    (parseDate(second) - parseDate(first)) / (1000 * 60 * 60 * 24)
  );
}
export const attendanceRate = (
  startDate,
  endDate,
  endTime,
  attendance_date
) => {
  const lastAttendTime = Date.parse(`${getFormatDate(endDate)} ${endTime}`);

  const attendanceDays = attendance_date.length;
  let totalDays;

  if (lastAttendTime > Date.now()) {
    totalDays = daysBetweenTwo(
      getFormatDate(startDate),
      //今天的后一天
      getFormatDate(getTomorrow(new Date()))
    );
  } else {
    totalDays = daysBetweenTwo(
      getFormatDate(startDate),
      getFormatDate(getTomorrow(endDate))
    );
  }
  const rate = Math.round((attendanceDays * 100) / totalDays);
  return rate;
};

export const isActivityStart = (startDate, startTime) => {
  const start = Date.parse(`${getFormatDate(startDate)} ${startTime}`);

  return Date.now() > start;
};

export const isActivityEnd = (endDate, endTime) => {
  const start = Date.parse(`${getFormatDate(endDate)} ${endTime}`);
  return Date.now() > start;
};
