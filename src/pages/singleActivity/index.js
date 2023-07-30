import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Map,
  CoverView,
  CoverImage,
} from "@tarojs/components";
import { AtCard, AtButton, AtMessage } from "taro-ui";
import * as activityApi from "../../api/activity";
import Taro, { useDidShow, useRouter } from "@tarojs/taro";
import { getFormatDate, AttendanceTime } from "../../utils/date";
import LoadingToast from "../../components/LoadingToast";
import center from "../../images/icons/center.png";
import { handleAtMessage } from "../../utils/message";
import "./index.scss";
const SingleActivity = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [activity, setActivity] = useState({});
  const [isSigned, setIsSigned] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const onSignup = async () => {
    setUploading(true);
    let { _id: activityId } = activity;
    const { _id: userId } = Taro.getStorageSync("user");
    const res = await activityApi.signup({ activityId, userId });
    console.log(res);
    if (res.statusCode === 200) {
      handleAtMessage("报名成功", "success");
      setTimeout(() => {
        Taro.switchTab({
          url: "/pages/index/index",
        });
      }, 2000);
    } else handleAtMessage("报名失败，请重试", "error");
    setUploading(false);
  };
  const openMap = () => {
    Taro.openLocation({
      latitude: Number(activity.location.latitude),
      longitude: Number(activity.location.latitude),
      address: activity.location.name,
      scale: 18,
    });
  };
  const getSingleActivity = async () => {
    setLoading(true);
    let { id: activityId } = router.params;
    const { _id: userId } = Taro.getStorageSync("user");

    const data = await activityApi.getSingle(activityId, { userId });

    if (data.user) {
      setActivity({
        ...data.activity,
        attendance_date: data.attendance_date,
        attendanceId: data._id,
      });
      setIsSigned(true);
    } else {
      setActivity(data);
    }
    setLoading(false);
  };

  const getMarker = () => {
    if (activity.location) {
      // console.log(typeof activity);
      const latitude = activity.location.latitude;
      const longitude = activity.location.longitude;

      return [
        {
          id: 1,
          latitude,
          longitude,
          iconPath: center,
          width: 30,
          height: 30,
          customCallout: {
            anchorY: -10,
            anchorX: 0,
            display: "ALWAYS",
          },
        },
      ];
    } else return [];
  };
  useDidShow(() => {
    const { admin } = Taro.getStorageSync("user");
    setIsAdmin(admin);
    getSingleActivity();
  });
  // useEffect(() => {
  //   getSingleActivity();
  // }, []);
  getMarker();
  // console.log(activity);
  return (
    <>
      <LoadingToast isOpened={loading} />
      <AtMessage />
      {activity.name ? (
        <View style={{ marginTop: "20rpx" }}>
          <AtCard
            extra={
              isAdmin
                ? ""
                : isSigned
                ? AttendanceTime(
                    activity.startDate,
                    activity.endDate,
                    activity.attendanceStartTime,
                    activity.attendanceEndTime,
                    activity.attendance_date
                  ).message
                : "待报名"
            }
            // isFull
            // key={a.activity._id}
            // note="小Tips"

            title={activity.name}
          >
            <Image
              style={{ width: "100%" }}
              src={activity.activityImage}
              mode="widthFix"
            />
            <View>
              <View className="textLine">
                <Text maxLines={20}>活动描述: {activity.desc}</Text>
              </View>
              <View className="textLine">
                <Text>开始日期：{getFormatDate(activity.startDate)}</Text>
              </View>
              <View>
                <Text>结束日期：{getFormatDate(activity.endDate)}</Text>
              </View>
              <View className="textLine">
                <Text>
                  签到时间：{activity.attendanceStartTime} 到{" "}
                  {activity.attendanceEndTime}
                </Text>
              </View>

              <View className="textLine">
                <Text selectable>地点：{activity.location.name}</Text>
              </View>
              <View style={{ width: "85vw", height: "36vh", margin: "20px 0" }}>
                <Map
                  // id="searchLocation"
                  style={{ height: "100%", width: "100%" }}
                  longitude={activity.location.longitude}
                  latitude={activity.location.latitude}
                  markers={getMarker()}
                  onTap={openMap}
                >
                  {/* <CoverView className="center-icon-box">
              <CoverImage className="icon" src={center}></CoverImage>
            </CoverView> */}
                </Map>
              </View>
            </View>
            {isAdmin ? (
              <AtButton type="primary" onClick={() => Taro.navigateBack()}>
                返回
              </AtButton>
            ) : isSigned ? (
              <AtButton
                disabled={
                  !AttendanceTime(
                    activity.startDate,
                    activity.endDate,
                    activity.attendanceStartTime,
                    activity.attendanceEndTime,
                    activity.attendance_date
                  ).status
                }
                size="small"
                type="primary"
                onClick={() =>
                  Taro.navigateTo({
                    url: `/pages/attendance/index?id=${activity.attendanceId}`,
                  })
                }
              >
                {
                  AttendanceTime(
                    activity.startDate,
                    activity.endDate,
                    activity.attendanceStartTime,
                    activity.attendanceEndTime,
                    activity.attendance_date
                  ).message
                }
              </AtButton>
            ) : (
              <AtButton
                disabled={uploading}
                size="small"
                type="primary"
                onClick={onSignup}
              >
                报名参加
              </AtButton>
            )}
            {/* {isSigned ? (
              <AtButton
                disabled={
                  !AttendanceTime(
                    activity.startDate,
                    activity.endDate,
                    activity.attendanceStartTime,
                    activity.attendanceEndTime,
                    activity.attendance_date
                  ).status
                }
                size="small"
                type="primary"
                onClick={() =>
                  Taro.navigateTo({
                    url: `/pages/attendance/index?id=${a._id}`,
                  })
                }
              >
                {
                  AttendanceTime(
                    activity.startDate,
                    activity.endDate,
                    activity.attendanceStartTime,
                    activity.attendanceEndTime,
                    activity.attendance_date
                  ).message
                }
              </AtButton>
            ) : (
              <AtButton
                disabled={uploading}
                size="small"
                type="primary"
                onClick={onSignup}
              >
                报名参加
              </AtButton>
            )} */}
          </AtCard>
        </View>
      ) : null}
    </>
  );
};

export default SingleActivity;
