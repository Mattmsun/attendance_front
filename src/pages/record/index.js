import { View, Text } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import React, { useEffect, useMemo, useState } from "react";
import * as activityApi from "../../api/activity";
import {
  AtButton,
  AtCard,
  AtProgress,
  AtSearchBar,
  AtIndexes,
  AtMessage,
} from "taro-ui";
import {
  attendanceRate,
  isActivityStart,
  getFormatDate,
  isActivityEnd,
} from "../../utils/date";
import LoadingToast from "../../components/LoadingToast";
import { getUsers } from "../../api/user";
import { handleAtMessage } from "../../utils/message";

const Record = () => {
  const [searchValue, setSearchValue] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const onChangeSearch = (value) => {
    setSearchValue(value);
  };

  const navigateToUserRecord = (id) => {
    Taro.navigateTo({
      url: `/pages/userRecord/index?id=${id}`,
    });
  };
  const onSearch = () => {
    const user = users.find((u) => u.name === searchValue);
    if (user) {
      navigateToUserRecord(user._id);
    } else {
      handleAtMessage("用户未找到", "error");
    }
  };
  const getAllUsers = async () => {
    setLoading(true);
    const user = Taro.getStorageSync("user");
    const { admin } = user;
    const res = await getUsers({ admin });
    setUsers(res.data);
    setLoading(false);
  };
  const getRecords = async () => {
    setLoading(true);
    const user = Taro.getStorageSync("user");
    const { _id: userId } = user;

    const res = await activityApi.getRecord({ userId });

    setRecord(res.data);
    setLoading(false);
  };
  useDidShow(() => {
    const user = Taro.getStorageSync("user");

    const { admin } = user;
    setIsAdmin(admin);
    if (admin) getAllUsers();
    else getRecords();
  });

  // const test = () => {
  //   if (record.length !== 0) {
  //     console.log("-----", record[4]);
  //     const a = isActivityStart(
  //       record[4].activity.startDate,
  //       record[4].activity.attendanceStartTime
  //     );
  //     console.log(Date.now());
  //     console.log("========", a);
  //   }
  // };
  // test();

  // console.log(record);
  // console.log(users);

  const NoRecord = () => (
    <View
      style={{ textAlign: "center", fontSize: "30rpx", marginTop: "20rpx" }}
    >
      <Text>当前无活动记录</Text>
    </View>
  );
  const User = () => {
    return record.map((r) => (
      <View style={{ marginTop: "20rpx" }} key={r._id}>
        <AtCard
          extra={
            isActivityEnd(r.activity.endDate, r.activity.attendanceEndTime)
              ? `已结束`
              : isActivityStart(
                  r.activity.startDate,
                  r.activity.attendanceStartTime
                )
              ? "进行中"
              : `未开始`
          }
          title={`活动名称: ${r.activity.name}`}
          extraStyle={
            isActivityEnd(r.activity.endDate, r.activity.attendanceEndTime)
              ? { color: "#a9b1c0" }
              : isActivityStart(
                  r.activity.startDate,
                  r.activity.attendanceStartTime
                )
              ? { color: "green" }
              : { color: "red" }
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
            {isActivityStart(
              r.activity.startDate,
              r.activity.attendanceStartTime
            ) ? (
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
            ) : (
              <View>
                <Text>活动未开始</Text>
              </View>
            )}
          </View>
          <View style={{ marginTop: "25rpx" }}>
            <AtButton
              onClick={() =>
                Taro.navigateTo({
                  url: `/pages/singleActivity/index?id=${r.activity._id}`,
                })
              }
              disabled={isActivityEnd(
                r.activity.endDate,
                r.activity.attendanceEndTime
              )}
              type={
                isActivityStart(
                  r.activity.startDate,
                  r.activity.attendanceStartTime
                )
                  ? "secondary"
                  : "primary"
              }
              size="small"
            >
              {isActivityEnd(r.activity.endDate, r.activity.attendanceEndTime)
                ? `活动已结束`
                : isActivityStart(
                    r.activity.startDate,
                    r.activity.attendanceStartTime
                  )
                ? "前往签到"
                : `查看活动`}
            </AtButton>
          </View>
        </AtCard>
      </View>
    ));
  };

  const Admin = () => (
    <View>
      <AtMessage />
      {users.length !== 0 ? (
        <AtIndexes
          list={[
            {
              title: "用户名字",
              // key: "A",
              items: users,
            },
          ]}
          topKey=""
          onClick={(item) => navigateToUserRecord(item._id)}
        >
          <AtSearchBar
            value={searchValue}
            onChange={onChangeSearch}
            placeholder={"查找用户的签到信息"}
            onActionClick={onSearch}
          />
        </AtIndexes>
      ) : null}
    </View>
  );

  return (
    <View>
      {/* {loading ? (
        <LoadingToast isOpened={loading} />
      ) : record.length !== 0 ? (
        <Admin />
      ) : (
        <NoRecord />
      )} */}
      {loading ? (
        <LoadingToast isOpened={loading} />
      ) : isAdmin ? (
        <Admin />
      ) : record.length !== 0 ? (
        <User />
      ) : (
        <NoRecord />
      )}
    </View>
  );
};

export default Record;
