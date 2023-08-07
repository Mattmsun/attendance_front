import {
  View,
  Button,
  Text,
  Image,
  Map,
  CoverView,
  CoverImage,
} from "@tarojs/components";

import center from "../../images/icons/center.png";
import { Picker } from "@tarojs/components";

var _ = require("lodash");

import {
  AtForm,
  AtInput,
  AtButton,
  AtTextarea,
  AtList,
  AtListItem,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtImagePicker,
  AtMessage,
} from "taro-ui";
import React, { useEffect, useState, useMemo } from "react";
import Taro, { useDidShow, useReady } from "@tarojs/taro";
import "./newActivity.scss";
import { baseUrl } from "../../utils/baseUrl";

const ActivityForm = () => {
  const [activity, setActivity] = useState({
    images: [],
    name: "",
    desc: "",
    startDate: "",
    endDate: "",
    attendanceStartTime: "07:00",
    attendanceEndTime: "08:00",
    location: {
      name: "",
      latitude: "31.093322",
      longitude: "121.346248",
    },
  });

  const [infoVerified, setInfoVerified] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  useEffect(() => {
    setActivity({
      ...activity,
      // set the startDate to today
      startDate: getFormatDate(new Date()),
      //set the endDate to tomorrow
      endDate: getFormatDate(new Date(), true),
    });
  }, []);
  // useDidShow(() => {
  //   setActivity({
  //     ...activity,
  //     // set the startDate to today
  //     startDate: getFormatDate(new Date()),
  //     //set the endDate to tomorrow
  //     endDate: getFormatDate(new Date(), true),
  //   });
  // });
  const handleChange = (value, e) => {
    const prop = e.mpEvent.target.id;
    setActivity({ ...activity, [prop]: value });
  };
  const handleChangeDesc = (value, e) => {
    setActivity({ ...activity, desc: value });
  };
  //date : dateObj eg new Date() tomorrow: boolean
  const getFormatDate = (date, tomorrow) => {
    let dateToFormat = date;
    if (tomorrow) {
      dateToFormat = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    }
    const dd = dateToFormat.getDate();
    const mm = dateToFormat.getMonth() + 1;
    const yyyy = dateToFormat.getFullYear();
    let formatDate;

    if (dd < 10 && mm < 10) {
      formatDate = yyyy + "-0" + mm + "-0" + dd;
    } else if (dd < 10 && mm >= 10) {
      formatDate = yyyy + "-" + mm + "-0" + dd;
    } else if (mm < 10 && dd > 10) {
      formatDate = yyyy + "-0" + mm + "-" + dd;
    } else formatDate = yyyy + "-" + mm + "-" + dd;

    return formatDate;
  };

  //get Thu Dec 08 2022 00:00:00 GMT+0000 (Western European Standard Time)
  const getDateObject = (date) => {
    const dateObj = new Date(date);
    return dateObj;
  };

  const onStartDateChange = (e) => {
    const startDate = e.detail.value;
    const endDate = getFormatDate(getDateObject(startDate), true);
    console.log(endDate);
    setActivity({ ...activity, startDate, endDate });
  };
  const onEndDateChange = (e) => {
    setActivity({ ...activity, endDate: e.detail.value });
  };

  const onStartTimeChange = (e) => {
    const startTime = e.detail.value;
    // const endDate = getFormatDate(getDateObject(startDate), true);
    setActivity({ ...activity, attendanceStartTime: startTime });
  };
  const onEndTimeChange = (e) => {
    setActivity({ ...activity, attendanceEndTime: e.detail.value });
  };
  const onChangeImage = (file) => {
    setActivity({ ...activity, images: file });
  };
  const onChangeImageFail = (mes) => {
    console.log(mes);
  };
  function onImageClick(index, file) {
    console.log(index, file);
  }
  const showImageBtn = () => {
    if (activity.images.length === 1) return false;
    else return true;
  };

  const handleAtMessage = (message, type) => {
    Taro.atMessage({
      message: message,
      type: type,
    });
  };
  const uploadImage = (image, formData) => {
    setUploading(true);
    return Taro.uploadFile({
      // url: "http://localhost:8000/api/activities", //仅为示例，非真实的接口地址
      url: `${baseUrl}/api/activities`,

      filePath: image.url,
      name: "image",
      formData,
      success(res) {
        if (res.statusCode === 200) {
          handleAtMessage("成功添加活动", "success");
          setTimeout(
            () =>
              Taro.switchTab({
                url: "/pages/user/index",
              }),
            2000
          );
        } else handleAtMessage("添加失败", "error");
        // console.log(res);
        //do something
      },
      fail: function (err) {
        handleAtMessage("添加失败", "error");
        // console.log(err);
      },
      complete: () => {
        setUploading(false);
      },
    });
  };

  const onChoosePosition = () => {
    Taro.chooseLocation({
      success: (res) => {
        // console.log("success", res);
        const { name, latitude, longitude, address } = res;
        setActivity({
          ...activity,
          location: { name: `${name}, ${address}`, latitude, longitude },
        });
      },
      fail: (err) => {
        console.log(err);
      },
    });
  };

  const verifyActivity = () => {
    if (!activity.name) {
      setVerifyMessage("活动名字不能为空");
      return setOpenModal(true);
    } else if (!activity.desc) {
      setVerifyMessage("活动描述不能为空");
      return setOpenModal(true);
    } else if (
      getDateObject(activity.endDate) <= getDateObject(activity.startDate)
    ) {
      setVerifyMessage("活动结束日期不能早于活动开始日期");
      return setOpenModal(true);
    } else if (!activity.location.name) {
      setVerifyMessage("活动地址不能为空");
      return setOpenModal(true);
    } else if (!activity.images.length === 0) {
      setVerifyMessage("请添加活动主题图片");
    } else {
      setInfoVerified(true);
    }
  };
  const onSubmit = async (event) => {
    verifyActivity();

    if (infoVerified) {
      const image = activity.images[0];
      const { name, latitude, longitude } = activity.location;
      const { admin } = Taro.getStorageSync("user");
      const formData = _.pick(activity, [
        "name",
        "desc",
        "startDate",
        "endDate",
        "attendanceStartTime",
        "attendanceEndTime",
      ]);
      formData.admin = admin;
      formData.location = name;
      formData.latitude = latitude;
      formData.longitude = longitude;
      uploadImage(image, formData);
    }
  };

  const onClickModal = () => {
    setOpenModal(false);
  };
  // console.log(activity);

  return (
    <View>
      <AtMessage />

      <View style={{ textAlign: "center" }}>
        <Text style={{ fontSize: "25rpx" }}>
          请添加活动图片, 建议尺寸750*420
        </Text>
        <AtImagePicker
          showAddBtn={showImageBtn()}
          multiple={false}
          length={1}
          count={1}
          mode="widthFix"
          files={activity.images}
          onChange={onChangeImage}
          onFail={onChangeImageFail}
          onImageClick={onImageClick}
        />
      </View>

      <View
        style={{
          marginTop: "20rpx",
          marginBottom: "20rpx",
          paddingLeft: "24rpx",
        }}
      >
        <Text style={{ fontSize: "35rpx" }}>活动的详情</Text>
      </View>

      <AtForm onSubmit={onSubmit}>
        <View className="formItem">
          <AtInput
            style={{ margin: 0 }}
            title="标题"
            name="name"
            border={false}
            required={true}
            type="text"
            placeholder="酒店实习"
            value={activity.name}
            onChange={handleChange}
          />
        </View>

        <View className="formItem">
          <AtTextarea
            height={300}
            hasBorder={false}
            value={activity.desc}
            onChange={handleChangeDesc}
            maxLength={200}
            placeholder="活动的描述"
          />
        </View>
        <View className="formItem">
          <View style={{ textAlign: "center" }}>
            <Text style={{ fontSize: "25rpx" }}>点击下方选择活动地点</Text>
          </View>
        </View>
        <View className="map-box">
          <Map
            // id="searchLocation"
            style={{ height: "100%", width: "100%" }}
            longitude={Number(activity.location.longitude)}
            latitude={Number(activity.location.latitude)}
            enableZoom={false}
            enableScroll={false}
            onTap={onChoosePosition}
          >
            <CoverView className="center-icon-box">
              <CoverImage className="icon" src={center}></CoverImage>
            </CoverView>
          </Map>
        </View>
        {activity.location.name ? (
          <View style={{ padding: "24rpx" }}>
            <Text style={{ marginRight: "20rpx" }}>活动地址 :</Text>
            <Text>{activity.location.name}</Text>
          </View>
        ) : null}
        <View className="formItem">
          <View>
            <Picker
              mode="date"
              start={getFormatDate(new Date())}
              onChange={onStartDateChange}
            >
              <AtList>
                <AtListItem
                  title="活动开始日期"
                  extraText={activity.startDate}
                />
              </AtList>
            </Picker>
          </View>
        </View>

        <View className="formItem">
          <View>
            <Picker
              mode="date"
              start={activity.endDate}
              onChange={onEndDateChange}
            >
              <AtList>
                <AtListItem
                  title="活动结束日期"
                  // onSwitchChange={(e) => console.log(e)}
                  extraText={activity.endDate}
                />
              </AtList>
            </Picker>
          </View>
        </View>

        <View className="formItem">
          <View>
            <Picker
              mode="time"
              start={activity.attendanceStartTime}
              onChange={onStartTimeChange}
            >
              <AtList>
                <AtListItem
                  title="签到开始时间"
                  // onSwitchChange={(e) => console.log(e)}
                  extraText={activity.attendanceStartTime}
                />
              </AtList>
            </Picker>
          </View>
        </View>

        <View className="formItem">
          <View>
            <Picker
              mode="time"
              start={activity.attendanceEndTime}
              onChange={onEndTimeChange}
            >
              <AtList>
                <AtListItem
                  title="签到结束时间"
                  // onSwitchChange={(e) => console.log(e)}
                  extraText={activity.attendanceEndTime}
                />
              </AtList>
            </Picker>
          </View>
        </View>

        <AtButton loading={uploading} formType="submit" type="primary">
          提交
        </AtButton>

        <AtModal isOpened={openModal}>
          <AtModalHeader>错误</AtModalHeader>

          <AtModalContent>{verifyMessage}</AtModalContent>
          <AtModalAction>
            <Button onClick={onClickModal}>确定</Button>
          </AtModalAction>
        </AtModal>
      </AtForm>
    </View>
  );
};

export default ActivityForm;
