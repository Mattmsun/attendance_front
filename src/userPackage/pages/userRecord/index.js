import { View, Text } from "@tarojs/components";
import Taro, { useDidShow, useRouter } from "@tarojs/taro";
import React, { useEffect, useMemo, useState } from "react";
import * as activityApi from "../../../api/activity";
import { AtButton, AtCard, AtProgress, AtSearchBar, AtIndexes } from "taro-ui";
import {
  attendanceRate,
  isActivityStart,
  getFormatDate,
  isActivityEnd,
} from "../../../utils/date";
import LoadingToast from "../../../components/LoadingToast";

const UserRecord = () => {
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState([]);
  const router = useRouter();

  const getRecords = async () => {
    setLoading(true);
    let { id: userId } = router.params;
    const res = await activityApi.getRecord({ userId });
    const currentActivities = res.data.filter((r) =>
      isActivityStart(r.activity.startDate, r.activity.attendanceStartTime)
    );
    setRecord(currentActivities);
    setLoading(false);
  };
  useDidShow(() => {
    getRecords();
  });

  // console.log(record);

  const NoRecord = () => (
    <View
      style={{ textAlign: "center", fontSize: "30rpx", marginTop: "20rpx" }}
    >
      <Text>用户未参加活动</Text>
    </View>
  );

  return (
    <View>
      {loading ? (
        <LoadingToast isOpened={loading} />
      ) : record.length !== 0 ? (
        <View>
          {record.map((r) => (
            <View style={{ marginTop: "20rpx" }} key={r._id}>
              <AtCard
                extra={
                  isActivityEnd(
                    r.activity.endDate,
                    r.activity.attendanceEndTime
                  )
                    ? `已结束`
                    : "进行中"
                }
                title={`活动名称: ${r.activity.name}`}
                extraStyle={
                  isActivityEnd(
                    r.activity.endDate,
                    r.activity.attendanceEndTime
                  )
                    ? { color: "#a9b1c0" }
                    : { color: "green" }
                }
              >
                <View>
                  <View style={{ marginBottom: "20rpx" }}>
                    <Text>开始日期：{getFormatDate(r.activity.startDate)}</Text>
                  </View>
                  <View>
                    <Text>结束日期：{getFormatDate(r.activity.endDate)}</Text>
                  </View>
                  <View style={{ marginTop: "20rpx", marginBottom: "20rpx" }}>
                    <Text>
                      签到时间：{r.activity.attendanceStartTime} 到{" "}
                      {r.activity.attendanceEndTime}
                    </Text>
                  </View>
                  <View>
                    <View style={{ fontSize: "30rpx" }}>出勤率：</View>
                    <AtProgress
                      percent={attendanceRate(
                        r.activity.startDate,
                        r.activity.endDate,
                        r.activity.attendanceEndTime,
                        r.attendance_date
                      )}
                    />
                  </View>
                </View>
              </AtCard>
            </View>
          ))}
          <View style={{ marginTop: "20rpx" }}>
            <AtButton
              onClick={() =>
                Taro.switchTab({
                  url: `/pages/record/index`,
                })
              }
              type="primary"
            >
              返回
            </AtButton>
          </View>
        </View>
      ) : (
        <NoRecord />
      )}
    </View>
  );
};

export default UserRecord;
