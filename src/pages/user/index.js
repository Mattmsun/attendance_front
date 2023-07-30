import { View, Text, Image } from "@tarojs/components";
import add from "../../images/icons/add.png";
import set from "../../images/icons/set.png";
import record from "../../images/icons/record.png";
import sign from "../../images/icons/sign.png";
import user from "../../images/icons/user.png";

var _ = require("lodash");

import { AtButton, AtGrid } from "taro-ui";
import React, { useEffect, useState, useMemo } from "react";
import Taro, { useDidShow, useReady } from "@tarojs/taro";
import "./index.scss";
import LoadingToast from "../../components/LoadingToast";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    avatar: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  useDidShow(() => {
    setLoading(true);
    const user = Taro.getStorageSync("user");

    const { name, image, admin } = user;
    setIsAdmin(admin);
    setUserInfo({ name, avatar: image });
    setLoading(false);
  });

  // useEffect(() => {
  //   setLoading(true);
  //   const user = Taro.getStorageSync("user");

  //   const { name, image } = user;
  //   console.log(name);
  //   setUserInfo({ name, avatar: image });
  //   setLoading(false);
  // }, []);

  const handleClick = (item, index) => {
    switch (index) {
      case 0:
        Taro.navigateTo({
          url: "/pages/newActivity/newActivity",
        });
        break;
      case 1:
        Taro.navigateTo({
          url: "/pages/editActivity/index",
        });
        break;
      case 2:
        Taro.navigateTo({
          url: "/pages/application/index",
        });
        break;
      case 3:
        Taro.navigateTo({
          url: "/pages/allRecords/index",
        });
        break;
      default:
        break;
    }
  };

  return (
    <View>
      {loading ? (
        <LoadingToast isOpened={loading} />
      ) : (
        <>
          <View className="userinfo">
            <View className="userinfo-avatar">
              {userInfo.avatar ? (
                <Image
                  src={userInfo.avatar}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              ) : (
                <Image
                  src={user}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              )}
            </View>
            <View style={{ marginTop: "20rpx", marginBottom: "20rpx" }}>
              <Text style={{ fontSize: "40rpx" }}>你好， {userInfo.name}</Text>
            </View>
          </View>
          <AtButton
            type="primary"
            size="small"
            onClick={() =>
              Taro.navigateTo({
                url: `/pages/updateUser/index?name=${userInfo.name}&image=${userInfo.avatar}`,
              })
            }
          >
            修改信息
          </AtButton>
          {isAdmin ? (
            <AtGrid
              onClick={handleClick}
              hasBorder={false}
              data={[
                {
                  image: add,
                  value: "新增活动",
                },
                {
                  image: set,
                  value: "修改活动",
                },
                {
                  image: sign,
                  value: "查看申请",
                },
                {
                  image: record,
                  value: "出席记录",
                },
              ]}
            />
          ) : null}
        </>
      )}
    </View>
  );
};

export default Index;
