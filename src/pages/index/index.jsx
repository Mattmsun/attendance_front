import { Component, useMemo } from "react";
import { View, Text, Image, Swiper, SwiperItem } from "@tarojs/components";
import {
  AtInput,
  AtForm,
  AtTabs,
  AtTabsPane,
  AtCard,
  AtSearchBar,
  AtMessage,
  AtButton,
} from "taro-ui";
import wrong from "../../images/icons/wrong.png";
import correct from "../../images/icons/correct.png";

import * as activity from "../../api/activity";
import React, { useEffect, useState } from "react";

import "taro-ui/dist/style/components/icon.scss";
import "./index.scss";
import "taro-ui/dist/style/components/tabs.scss";
import Taro, { useDidShow } from "@tarojs/taro";
import LoadingToast from "../../components/LoadingToast";
import {
  getFormatDate,
  AttendanceTime,
  isActivityEnd,
  isActivityStart,
} from "../../utils/date";
import { differenceBy } from "lodash";
import { handleAtMessage } from "../../utils/message";
import { baseUrl } from "../../utils/baseUrl";

const index = () => {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedActivity, setSignedActivity] = useState([]);
  const [currentActivity, setCurrentActivity] = useState([]);
  const [futureActivity, setFutureActivity] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activities, setActivities] = useState([]);
  const [current, setCurrent] = useState(0);
  const userTabList = [{ title: "已报名" }, { title: "未报名" }];
  const adminTabList = [{ title: "进行中" }, { title: "未开始" }];

  const handleTabs = (value) => {
    setCurrent(value);
  };
  const getActivities = async () => {
    setLoading(true);
    const actData = await activity.get();
    setActivities(actData);
    //正在进行的活动
    setCurrentActivity(
      actData.filter(
        (a) =>
          !isActivityEnd(a.endDate, a.attendanceEndTime) &&
          isActivityStart(a.startDate, a.attendanceStartTime)
      )
    );
    //将要进行的活动
    setFutureActivity(
      actData.filter(
        (a) => !isActivityStart(a.startDate, a.attendanceStartTime)
      )
    );

    setLoading(false);
  };
  const getUserActivities = async () => {
    setLoading(true);

    const user = Taro.getStorageSync("user");

    const { _id: userId } = user;

    const signedActData = await activity.getSigned({ userId });

    setSignedActivity(signedActData);

    setLoading(false);
  };
  useDidShow(() => {
    login();
    getActivities();
  });
  useEffect(() => {
    console.log(baseUrl);
  }, []);
  //用户登入
  const login = () => {
    setLoading(true);
    const user = Taro.getStorageSync("user");
    if (!user) {
      Taro.login({
        success: function (res) {
          if (res.code) {
            //发起网络请求
            Taro.request({
              // url: "http://localhost:8000/api/users/login",
              url: `${baseUrl}/api/users/login`,

              data: {
                code: res.code,
              },
              success: async (res) => {
                const { data, statusCode } = res;
                // console.log(statusCode);

                if (statusCode === 200) {
                  Taro.setStorageSync("user", data);
                  if (data.admin) {
                    setIsAdmin(true);
                  } else {
                    //成功登入后获取用户报名的项目
                    getUserActivities();
                  }
                }
              },
            });
          } else {
            console.log("登录失败！" + res.errMsg);
          }
        },
        complete() {
          setLoading(false);
        },
      });
    } else {
      if (user.admin) setIsAdmin(true);
      else getUserActivities();
      // console.log("以登入");
    }
  };

  const unsignedActivity = () => {
    const userActivity = signedActivity.map((a) => a.activity);
    const unsignedActivity = differenceBy(activities, userActivity, "_id");
    return unsignedActivity.filter(
      (a) => !isActivityStart(a.startDate, a.attendanceStartTime)
    );
  };

  const navigateToActivity = (id) => {
    Taro.navigateTo({
      url: `/activityPackage/pages/singleActivity/index?id=${id}`,
    });
  };
  const onChangeSearch = (value) => {
    setSearchValue(value);
  };
  const onSearch = () => {
    const activity = activities.find(
      (a) =>
        a.name === searchValue &&
        !isActivityStart(a.startDate, a.attendanceStartTime)
    );
    if (activity) {
      navigateToActivity(activity._id);
    } else {
      handleAtMessage("目前没有此活动", "error");
    }
  };

  // console.log(process.env.TARO_APP_API);
  const Admin = () => (
    <View>
      <AtTabs current={current} tabList={adminTabList} onClick={handleTabs}>
        <AtTabsPane current={current} index={0}>
          {currentActivity.map((a) => (
            <View key={a._id} style={{ marginTop: "20px" }}>
              <AtCard
                style={{ border: 0 }}
                // extra={a.status === "inactive" ? "待审核" : "已通过"}
                // extraStyle={
                //   a.status === "inactive"
                //     ? { color: "red" }
                //     : { color: "green" }
                // }
                title={a.name}
                // thumb={a.status === "inactive" ? wrong : correct}
              >
                <View>
                  <Image
                    style={{ width: "100%" }}
                    src={a.activityImage}
                    mode="aspectFill"
                  />
                </View>
                <View>
                  <View>
                    <Text>开始日期：{getFormatDate(a.startDate)}</Text>
                  </View>
                  <View>
                    <Text>结束日期：{getFormatDate(a.endDate)}</Text>
                  </View>
                  <View>
                    <Text>地点：{a.location.name}</Text>
                  </View>
                </View>
                <AtButton
                  size="small"
                  type="primary"
                  onClick={() =>
                    Taro.navigateTo({
                      url: `/activityPackage/pages/singleActivity/index?id=${a._id}`,
                    })
                  }
                >
                  查看活动
                </AtButton>
              </AtCard>
            </View>
          ))}
        </AtTabsPane>
        <AtTabsPane current={current} index={1}>
          {futureActivity.map((a) => (
            <View key={a._id} style={{ marginTop: "20px" }}>
              <AtCard style={{ border: 0 }} title={a.name}>
                <Image
                  style={{ width: "100%" }}
                  src={a.activityImage}
                  mode="aspectFill"
                />
                <View>
                  <View>
                    <Text>开始日期：{getFormatDate(a.startDate)}</Text>
                  </View>
                  <View>
                    <Text>结束日期：{getFormatDate(a.endDate)}</Text>
                  </View>
                  <View>
                    <Text>地点：{a.location.name}</Text>
                  </View>
                </View>

                <AtButton
                  size="small"
                  type="primary"
                  onClick={() =>
                    Taro.navigateTo({
                      url: `/activityPackage/pages/singleActivity/index?id=${a._id}`,
                    })
                  }
                >
                  查看活动
                </AtButton>
              </AtCard>
            </View>
          ))}
        </AtTabsPane>
      </AtTabs>
    </View>
  );
  const User = () => (
    <View>
      <AtTabs current={current} tabList={userTabList} onClick={handleTabs}>
        <AtTabsPane current={current} index={0}>
          {signedActivity.map((a) => (
            <View key={a.activity._id} style={{ marginTop: "20px" }}>
              <AtCard
                style={{ border: 0 }}
                extra={a.status === "inactive" ? "待审核" : "已通过"}
                extraStyle={
                  a.status === "inactive"
                    ? { color: "red" }
                    : { color: "green" }
                }
                title={a.activity.name}
                thumb={a.status === "inactive" ? wrong : correct}
              >
                <Image
                  style={{ width: "100%" }}
                  src={a.activity.activityImage}
                  mode="aspectFill"
                />
                <View>
                  <View>
                    <Text>开始日期：{getFormatDate(a.activity.startDate)}</Text>
                  </View>
                  <View>
                    <Text>结束日期：{getFormatDate(a.activity.endDate)}</Text>
                  </View>
                  <View>
                    <Text>地点：{a.activity.location.name}</Text>
                  </View>
                </View>
                {a.status === "inactive" ? (
                  <AtButton disabled size="small" type="primary">
                    请与活动方联系
                  </AtButton>
                ) : (
                  <AtButton
                    size="small"
                    type="primary"
                    disabled={
                      !AttendanceTime(
                        a.activity.startDate,
                        a.activity.endDate,
                        a.activity.attendanceStartTime,
                        a.activity.attendanceEndTime,
                        a.attendance_date
                      ).status
                    }
                    onClick={() =>
                      Taro.navigateTo({
                        url: `/activityPackage/pages/attendance/index?id=${a._id}`,
                      })
                    }
                  >
                    {
                      AttendanceTime(
                        a.activity.startDate,
                        a.activity.endDate,
                        a.activity.attendanceStartTime,
                        a.activity.attendanceEndTime,
                        a.attendance_date
                      ).message
                    }
                  </AtButton>
                )}
              </AtCard>
            </View>
          ))}
        </AtTabsPane>
        <AtTabsPane current={current} index={1}>
          {unsignedActivity().map((a) => (
            <View key={a._id} style={{ marginTop: "20px" }}>
              <AtCard style={{ border: 0 }} title={a.name}>
                <Image
                  style={{ width: "100%" }}
                  src={a.activityImage}
                  mode="aspectFill"
                />
                <View>
                  <View>
                    <Text>开始日期：{getFormatDate(a.startDate)}</Text>
                  </View>
                  <View>
                    <Text>结束日期：{getFormatDate(a.endDate)}</Text>
                  </View>
                  <View>
                    <Text>地点：{a.location.name}</Text>
                  </View>
                </View>

                <AtButton
                  size="small"
                  type="primary"
                  onClick={() => navigateToActivity(a._id)}
                >
                  报名参加
                </AtButton>
              </AtCard>
            </View>
          ))}
        </AtTabsPane>
      </AtTabs>
    </View>
  );

  const Home = () => (
    <View>
      <AtMessage />

      {activities.length !== 0 ? (
        <View>
          <Swiper
            style={{ width: "100vm", height: "40vh" }}
            indicatorColor="#999"
            indicatorActiveColor="#333"
            circular
            indicatorDots
            autoplay
          >
            {activities.map((activity) => (
              <SwiperItem key={activity._id}>
                <Image
                  style={{ width: "100%", height: "100%" }}
                  src={activity.activityImage}
                  mode="aspectFill"
                />
              </SwiperItem>
            ))}
          </Swiper>
          {isAdmin ? <Admin /> : <User />}
        </View>
      ) : null}
    </View>
  );

  return (
    <View>
      {loading ? (
        <LoadingToast isOpened={loading} />
      ) : (
        <>
          <AtSearchBar
            value={searchValue}
            onChange={onChangeSearch}
            // focus
            onActionClick={onSearch}
          />
          <Home />
        </>
      )}
    </View>
  );
};

export default index;
