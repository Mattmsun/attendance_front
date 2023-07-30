import { View, Image, Text } from "@tarojs/components";
import Taro, { useDidShow, useRouter } from "@tarojs/taro";
import React, { useRef, useState } from "react";
import { getAllAttendance } from "../../api/user";
import LoadingToast from "../../components/LoadingToast";
import { AtCard, AtProgress, AtAvatar, AtTabs, AtTabsPane } from "taro-ui";
import { getFormatDate, isActivityEnd, attendanceRate } from "../../utils/date";
import "./index.scss";
let _ = require("lodash");

const Records = () => {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const router = useRouter();

  const handleClick = (value) => {
    setCurrent(value);
  };

  const getAttendances = async () => {
    setLoading(true);
    const user = Taro.getStorageSync("user");
    const { admin } = user;
    const res = await getAllAttendance({ admin });

    if (res.statusCode === 200) {
      const activityList = mergedActivity(res.data);

      setActivityList(activityList);
      setCurrent(currentIndex(activityList));
    }
    // setAttendance(res.data);
    setLoading(false);
  };
  const currentIndex = (activityList) => {
    let { id: activityId } = router.params;
    const index = activityList.findIndex((a) => a.activity._id === activityId);
    if (index !== -1) return index;
    else return 0;
  };
  // test();
  // console.log(current);
  useDidShow(() => {
    getAttendances();
  });
  const attendanceArr = (activity) => {
    const { startDate, endDate, attendanceEndTime } = activity.activity;
    return activity.attendance_date.map((a) =>
      attendanceRate(startDate, endDate, attendanceEndTime, a)
    );
  };
  const averageAttendanceRate = (activity) => {
    const attendArray = attendanceArr(activity);
    const sum = attendArray.reduce((a, b) => a + b, 0);
    const averageRate = sum / attendArray.length;
    return Math.round(averageRate);
  };

  // console.log(activityList);
  const mergedActivity = (array) => {
    var output = [];

    array.forEach(function (item) {
      var existing = output.filter(function (v, i) {
        return v.activity._id == item.activity._id;
      });
      if (existing.length) {
        var existingIndex = output.indexOf(existing[0]);
        output[existingIndex].user = output[existingIndex].user.concat(
          item.user
        );
        output[existingIndex].attendance_date = output[
          existingIndex
        ].attendance_date.concat([item.attendance_date]);
      } else {
        if (!Array.isArray(item.user)) item.user = [item.user];
        if (typeof item.attendance_date[0] !== "object")
          item.attendance_date = [item.attendance_date];
        output.push(item);
      }
    });
    return output;
  };

  const NoActivities = () => (
    <View
      style={{
        marginTop: "25rpx",
        textAlign: "center",
        fontSize: "30rpx",
      }}
    >
      暂无活动记录
    </View>
  );

  const ActivityRecords = () => (
    <View>
      {activityList.length !== 0 ? (
        <AtTabs
          current={current}
          scroll
          tabList={activityList.map((a) => ({ ...a, title: a.activity.name }))}
          onClick={handleClick}
        >
          {activityList.map((a, index) => (
            <AtTabsPane current={current} index={index}>
              <View key={a.activity._id} style={{ marginTop: "25rpx" }}>
                <AtCard
                  style={{ border: 0 }}
                  title={a.activity.name}
                  extra={
                    isActivityEnd(
                      a.activity.endDate,
                      a.activity.attendanceEndTime
                    )
                      ? `活动已结束`
                      : `活动进行中`
                  }
                  extraStyle={
                    isActivityEnd(
                      a.activity.endDate,
                      a.activity.attendanceEndTime
                    )
                      ? { color: "#a9b1c0" }
                      : { color: "green" }
                  }
                >
                  <Image
                    style={{ width: "100%" }}
                    src={a.activity.activityImage}
                    mode="widthFix"
                  />
                  <View>
                    <View className="text-line">
                      <Text>
                        开始日期：{getFormatDate(a.activity.startDate)}
                      </Text>
                    </View>
                    <View>
                      <Text>结束日期：{getFormatDate(a.activity.endDate)}</Text>
                    </View>
                    <View className="text-line">
                      <Text>地点：{a.activity.location.name}</Text>
                    </View>

                    <View className="report-line">
                      参与人数: {a.user.length}
                    </View>
                    <View>
                      {a.user.map((u, index) => (
                        <View className="at-row at-row__align--center">
                          <View className="at-col at-col-2">
                            <View>
                              <Text selectable>{u.name}</Text>
                            </View>
                            <AtAvatar circle size="small" image={u.image} />{" "}
                          </View>
                          <View className="at-col at-col-10">
                            <AtProgress
                              color={
                                attendanceArr(a)[index] <= 50 ? "" : "green"
                              }
                              percent={attendanceArr(a)[index]}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                    <View
                      style={{ marginTop: "20rpx" }}
                      className="report-line"
                    >
                      平均出勤率: {averageAttendanceRate(a)}%
                    </View>

                    <View>
                      <AtProgress
                        color={averageAttendanceRate(a) <= 50 ? "" : "green"}
                        percent={averageAttendanceRate(a)}
                      />
                    </View>
                  </View>
                </AtCard>
              </View>
            </AtTabsPane>
          ))}
        </AtTabs>
      ) : null}
    </View>
  );
  return (
    <View>
      {loading ? (
        <LoadingToast isOpened={loading} />
      ) : activityList.length === 0 ? (
        <NoActivities />
      ) : (
        <ActivityRecords />
      )}
    </View>
  );
};
export default Records;
