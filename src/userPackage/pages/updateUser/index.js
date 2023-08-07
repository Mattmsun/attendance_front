import { View, Button, Text, Image } from "@tarojs/components";
import userIcon from "../../../images/icons/user.png";

var _ = require("lodash");

import { AtInput, AtButton, AtMessage, AtModal } from "taro-ui";
import React, { useEffect, useState, useMemo } from "react";
import Taro, { getCurrentPages, useRouter } from "@tarojs/taro";

import "./index.scss";
import { handleAtMessage } from "../../../utils/message";
import { baseUrl } from "../../../utils/baseUrl";

const updateUserApi = "/api/users";

const UpdateInfo = () => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isImageChange, setIsImageChange] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    avatar: "",
  });
  useEffect(() => {
    let { name, image } = router.params;
    if (image === "undefined") image = undefined;
    setUserInfo({ name, avatar: image });
  }, []);
  // const baseUrl = "http://localhost:8000";

  const uploadImage = (filePath, formData, api) => {
    setUploading(true);

    //如果用户选择了新照片
    if (isImageChange) {
      return Taro.uploadFile({
        url: `${baseUrl}${api}`,
        filePath,
        name: "image",
        formData,
        success(res) {
          if (res.statusCode === 200) {
            // console.log(res);
            handleAtMessage("用户信息已更新", "success");

            Taro.setStorageSync("user", JSON.parse(res.data));
            setTimeout(() => Taro.navigateBack(), 2000);
            // Taro.navigateBack();
          } else handleAtMessage("出现错误", "error");
          // console.log(res);
          //do something
        },
        fail: function (err) {
          handleAtMessage("出现错误", "error");
          console.log(err);
        },
        complete: () => {
          setUploading(false);
        },
      });
    } else {
      Taro.request({
        url: `${baseUrl}${api}`,
        method: "POST",
        data: formData,
        success: function (res) {
          // console.log(res);
          // handleAtMessage("用户信息已更新", "success");
          if (res.statusCode === 200) {
            handleAtMessage("用户信息已更新", "success");

            Taro.setStorageSync("user", res.data);

            setTimeout(() => Taro.navigateBack(), 2000);
          } else handleAtMessage("出现错误", "error");
        },
        fail: function (err) {
          handleAtMessage("出现错误", "error");
          console.log(err);
        },
        complete: () => {
          setUploading(false);
        },
      });
    }
  };

  const updateUserInfo = () => {
    const { name, avatar } = userInfo;
    if (!name) {
      return setOpenModal(true);
    }
    const user = Taro.getStorageSync("user");
    const { _id: userId } = user;

    uploadImage(avatar, { name, userId }, updateUserApi);
  };

  const handleGetUserProfile = (e) => {
    if (e.detail) {
      setIsImageChange(true);
    }
    // console.log(e.detail);
    const { avatarUrl } = e.detail;
    setUserInfo({ ...userInfo, avatar: avatarUrl });
  };
  return (
    <>
      <AtMessage />
      <View>
        <View className="userinfo">
          <Button
            plain
            size="mini"
            style={{ border: 0 }}
            openType="chooseAvatar"
            onChooseAvatar={handleGetUserProfile}
          >
            <View className="userinfo-avatar">
              {userInfo.avatar ? (
                <Image
                  src={userInfo.avatar}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              ) : (
                <Image
                  src={userIcon}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              )}
            </View>
          </Button>

          <AtInput
            style={{ marginTop: "20rpx", marginBottom: "20rpx" }}
            name="name"
            title="用户名"
            type="text"
            placeholder="请填写你的用户名"
            value={userInfo.name}
            onChange={(value) => setUserInfo({ ...userInfo, name: value })}
          />
        </View>
        <AtButton
          size="small"
          type="primary"
          disabled={uploading}
          loading={uploading}
          onClick={updateUserInfo}
        >
          保存
        </AtButton>
        <AtModal
          isOpened={openModal}
          title="用户名不能为空"
          confirmText="确认"
          onConfirm={() => setOpenModal(false)}
        />
      </View>
    </>
  );
};

export default UpdateInfo;
