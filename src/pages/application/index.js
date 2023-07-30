import Taro, { useDidShow } from "@tarojs/taro";
import React, { useEffect, useState } from "react";
import * as userApi from "../../api/user";
import { View, Image, Text } from "@tarojs/components";
import { AtCard, AtAvatar, AtButton, AtMessage } from "taro-ui";
import LoadingToast from "../../components/LoadingToast";
import { getFormatDate } from "../../utils/date";
import { handleAtMessage } from "../../utils/message";
import user from "../../images/icons/user.png";
import wrong from "../../images/icons/wrong.png";

AtCard;
const Application = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  const getApplicant = async () => {
    setLoading(true);
    const res = await userApi.getApplicant();
    setApplicants(res);
    setLoading(false);
  };

  useDidShow(() => {
    getApplicant();
  });
  const approveApplicant = async (id, approved) => {
    if (approved) {
      const res = await userApi.approveApplicant(id, { approved: true });
      if (res.statusCode === 200) {
        handleAtMessage("已批申请人", "success");
        setTimeout(() => {
          Taro.redirectTo({
            url: "/pages/application/index",
          });
        }, 1000);
      } else handleAtMessage("出现错误", "error");
    } else {
      const res = await userApi.approveApplicant(id, { approved: false });
      if (res.statusCode === 200) {
        handleAtMessage("已拒绝申请人", "success");
        setTimeout(() => {
          Taro.redirectTo({
            url: "/pages/application/index",
          });
        }, 2000);
      } else handleAtMessage("出现错误", "error");
    }
  };
  const onApprove = (id) => {
    approveApplicant(id, true);
  };
  const onReject = (id) => {
    approveApplicant(id, false);
  };
  // console.log(applicants);
  const NoApplicant = () => (
    <View
      style={{
        marginTop: "25rpx",
        textAlign: "center",
        fontSize: "30rpx",
      }}
    >
      暂无申请人
    </View>
  );
  return (
    <>
      <LoadingToast isOpened={loading} />
      <AtMessage />
      {!loading
        ? applicants.map((a) => (
            <View style={{ marginTop: "20px" }} key={a._id}>
              <AtCard
                extra={`申请日期： ${getFormatDate(a.created_date)}`}
                extraStyle={{ display: "contents", color: "#8b9dc3" }}
                title={`申请人: ${a.user.name}`}
                renderIcon=<View style={{ marginRight: "10rpx" }}>
                  <AtAvatar
                    image={a.user.image ? a.user.image : user}
                    size="small"
                  />
                </View>
              >
                <View>
                  <Text>申请活动：{a.activity.name}</Text>
                </View>
                <View>
                  <Text>
                    活动开始日期: {getFormatDate(a.activity.startDate)}
                  </Text>
                </View>
                <View>
                  <Text>活动结束日期: {getFormatDate(a.activity.endDate)}</Text>
                </View>
                <View>
                  <Text>活动地址: {a.activity.location.name}</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20rpx",
                  }}
                >
                  <View style={{ width: "40vw" }}>
                    <AtButton
                      size="small"
                      type="primary"
                      onClick={() => onApprove(a._id)}
                    >
                      批准
                    </AtButton>
                  </View>
                  <View style={{ width: "40vw" }}>
                    <AtButton
                      size="small"
                      type="secondary"
                      onClick={() => onReject(a._id)}
                    >
                      拒绝
                    </AtButton>
                  </View>
                </View>
              </AtCard>
            </View>
          ))
        : null}

      {!loading && applicants.length === 0 ? <NoApplicant /> : null}
    </>
  );
};

export default Application;
