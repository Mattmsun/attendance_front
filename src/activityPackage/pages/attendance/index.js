import React, { useEffect, useState } from "react";
import Taro, { useDidShow, useRouter } from "@tarojs/taro";
import * as activityApi from "../../../api/activity";
import { View, Text, Map } from "@tarojs/components";
import LoadingToast from "../../../components/LoadingToast";
import center from "../../../images/icons/center.png";

import {
  AtButton,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtCard,
} from "taro-ui";
import { getFormatDate } from "../../../utils/date";

//in m
const safeDistance = 300;
const Attendance = () => {
  const router = useRouter();
  const [attendance, setAttendance] = useState({});
  const [distance, setDistance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userLatitude, setUserLatitude] = useState("");
  const [userLongitude, setUserLongitude] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [upLoading, setUpLoading] = useState(false);
  const getAttendance = async () => {
    setLoading(true);
    // return console.log(router.params);
    let { id: attendanceId } = router.params;
    const res = await activityApi.getAttendance(attendanceId);
    setAttendance(res.data);
    setLoading(false);
  };
  // console.log("-----", { userLatitude, userLongitude });
  useDidShow(() => {
    getAttendance();
  });

  useEffect(() => {});

  const getMarker = () => {
    if (attendance.activity) {
      // console.log(typeof activity);
      const latitude = attendance.activity.location.latitude;
      const longitude = attendance.activity.location.longitude;

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
  const getLocation = () => {
    return Taro.getSetting({
      success: (res) => {
        res.authSetting = {
          "scope.userInfo": true,
          "scope.userLocation": true,
        };

        // 用户同意授权
        if (res.authSetting["scope.userLocation"]) {
          // 获取用户地理位置的经度和纬度
          Taro.getLocation({
            type: "gcj02",
            success: function (res) {
              setUpLoading(true);
              // console.log(res);
              const { latitude, longitude } = attendance.activity.location;
              processLoaction(res.latitude, res.longitude, latitude, longitude);
            },

            //用户拒绝授权
            fail: (res) => {
              isAuthorized();
            },
            complete: () => {
              setUpLoading(false);
            },
          });
        }
      },
      fail: () => {},
    });
  };
  const isAuthorized = () => {
    Taro.showModal({
      title: "温馨提示",
      content: "需要获取您的位置信息，请允许",
      success: (tip) => {
        if (tip.confirm) {
          setUpLoading(true);
          Taro.openSetting({
            success: (data) => {
              if (data.authSetting["scope.userLocation"]) {
                Taro.getLocation({
                  success: (res) => {
                    const { latitude, longitude } =
                      attendance.activity.location;

                    processLoaction(
                      res.latitude,
                      res.longitude,
                      latitude,
                      longitude
                    );
                    // openLocation();
                    // init();
                  },
                });
              }
            },
            complete: () => {
              setUpLoading(false);
            },
          });
        } else if (tip.cancel) {
          Taro.navigateBack();
        }
      },
    });
  };
  const openMap = () => {
    Taro.openLocation({
      latitude: Number(attendance.activity.location.latitude),
      longitude: Number(attendance.activity.location.latitude),
      address: attendance.activity.location.name,
      scale: 18,
    });
  };
  const openLocation = () => {
    Taro.openLocation({
      latitude: userLatitude,
      longitude: userLongitude,
      scale: 18,
    });
  };

  const processLoaction = async (
    userLat,
    userLon,
    activityLat,
    activityLon
  ) => {
    setUserLongitude(userLon);
    setUserLatitude(userLat);
    const currentDistance = getDistance(
      userLat,
      userLon,
      activityLat,
      activityLon
    );
    setDistance(currentDistance);
    const isValid = checkDistance(currentDistance, safeDistance);
    if (isValid) {
      const res = await activityApi.attendance(attendance._id, {
        attendanceDate: new Date(),
      });
      setOpenModal(true);
    } else setOpenModal(true);
  };
  function getDistance(lat1, lon1, lat2, lon2) {
    const r = 6371; // km
    const p = Math.PI / 180;

    const a =
      0.5 -
      Math.cos((lat2 - lat1) * p) / 2 +
      (Math.cos(lat1 * p) *
        Math.cos(lat2 * p) *
        (1 - Math.cos((lon2 - lon1) * p))) /
        2;
    let dis = 2 * r * Math.asin(Math.sqrt(a));
    dis = Math.floor(dis * 1000);
    return dis;
  }

  const checkDistance = (distance, safeDistance) => {
    if (distance > safeDistance) {
      setVerifyMessage({
        title: "签到失败",
        body: "不在签到范围内",
        status: 0,
      });
      return false;
    } else
      setVerifyMessage({
        title: "签到成功",
        body: "您已签到成功，请前往活动",
        status: 1,
      });
    return true;
  };
  const onClickModal = () => {
    if (verifyMessage.status) {
      Taro.switchTab({ url: `/pages/index/index` });
    }
    setOpenModal(false);
  };
  return (
    <View>
      {loading ? (
        <LoadingToast />
      ) : attendance.activity ? (
        <View style={{ marginTop: "25rpx" }}>
          <AtCard style={{ border: 0 }} title={attendance.activity.name}>
            <View style={{ marginTop: "15rpx", marginBottom: "15rpx" }}>
              <Text>
                {`签到时间: ${getFormatDate(
                  attendance.activity.startDate
                )} 至 ${getFormatDate(attendance.activity.endDate)}`}
              </Text>
            </View>
            <View style={{ marginTop: "15rpx", marginBottom: "15rpx" }}>
              <Text>{`每天：${attendance.activity.attendanceStartTime} 至 ${attendance.activity.attendanceEndTime}`}</Text>
            </View>
            <View style={{ width: "85vw", height: "36vh", margin: "20px 0" }}>
              <Map
                // id="searchLocation"
                style={{ height: "100%", width: "100%" }}
                longitude={attendance.activity.location.longitude}
                latitude={attendance.activity.location.latitude}
                // latitude={userLatitude}
                // longitude={userLongitude}
                markers={getMarker()}
                showLocation
                onTap={openMap}
              ></Map>
            </View>
            <AtButton
              size="small"
              disabled={upLoading}
              type="primary"
              onClick={getLocation}
            >
              签到
            </AtButton>

            {/* <View>距离：{distance}米</View> */}
          </AtCard>
        </View>
      ) : null}

      <AtModal isOpened={openModal}>
        <AtModalHeader>{verifyMessage.title}</AtModalHeader>

        <AtModalContent>{verifyMessage.body}</AtModalContent>
        <AtModalAction>
          <AtButton size="small" type="primary" onClick={onClickModal}>
            确定
          </AtButton>
        </AtModalAction>
      </AtModal>
    </View>
  );
};

export default Attendance;
