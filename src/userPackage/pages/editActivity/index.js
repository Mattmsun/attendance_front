import Taro, { useDidShow } from "@tarojs/taro";
import React, { useState } from "react";
import { get } from "../../../api/activity";
import LoadingToast from "../../../components/LoadingToast";
import { View, Image, Text } from "@tarojs/components";
import {
  AtButton,
  AtCard,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtMessage,
} from "taro-ui";
import {
  getFormatDate,
  isActivityEnd,
  isActivityStart,
} from "../../../utils/date";
import { deleteActivity } from "../../../api/user";
import { handleAtMessage } from "../../../utils/message";

const EditActivity = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [deletId, setDeleteId] = useState("");
  const [activities, setActivities] = useState([]);
  const getActivities = async () => {
    setLoading(true);
    const actData = await get();

    setActivities(actData);

    setLoading(false);
  };
  useDidShow(() => {
    getActivities();
  });
  const onOpenModal = (id) => {
    setOpenModal(true);
    setDeleteId(id);
  };
  const onDeleteActivity = async () => {
    setUploading(true);
    const user = Taro.getStorageSync("user");
    const { admin } = user;
    const res = await deleteActivity(deletId, { admin });
    if (res.statusCode === 200) {
      handleAtMessage("活动已删除", "success");
      setTimeout(() => {
        Taro.redirectTo({
          url: "/userPackage/pages/editActivity/index",
        });
      }, 2000);
    } else {
      handleAtMessage("出现错误", "error");
    }
    setOpenModal(false);
    setUploading(false);

    console.log(res);
  };
  // console.log(activities);

  const NoActivities = () => (
    <View
      style={{
        marginTop: "25rpx",
        textAlign: "center",
        fontSize: "30rpx",
      }}
    >
      暂无活动
    </View>
  );
  const ActivityList = () => (
    <View>
      {activities.length !== 0
        ? activities.map((a) => (
            <View key={a._id} style={{ marginTop: "20px" }}>
              <AtCard
                style={{ border: 0 }}
                extra={
                  isActivityEnd(a.endDate, a.attendanceEndTime)
                    ? `已结束`
                    : isActivityStart(a.startDate, a.attendanceStartTime)
                    ? "进行中"
                    : `未开始`
                }
                title={a.name}
                extraStyle={
                  isActivityEnd(a.endDate, a.attendanceEndTime)
                    ? { color: "#a9b1c0" }
                    : isActivityStart(a.startDate, a.attendanceStartTime)
                    ? { color: "green" }
                    : { color: "red" }
                }
                note="进行中的活动无法删除"
              >
                <Image
                  style={{ width: "100%" }}
                  src={a.activityImage}
                  mode="widthFix"
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
                <View>
                  <View
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "25rpx",
                    }}
                  >
                    <View style={{ width: "40vw" }}>
                      <AtButton
                        type="secondary"
                        size="small"
                        onClick={() =>
                          Taro.navigateTo({
                            url: `/activityPackage/pages/singleActivity/index?id=${a._id}`,
                          })
                        }
                      >
                        查看活动
                      </AtButton>
                    </View>
                    <View style={{ width: "40vw" }}>
                      {isActivityStart(a.startDate, a.attendanceStartTime) &&
                      !isActivityEnd(a.endDate, a.attendanceEndTime) ? (
                        <AtButton
                          type="secondary"
                          size="small"
                          onClick={() =>
                            Taro.navigateTo({
                              url: `/userPackage/pages/allRecords/index?id=${a._id}`,
                            })
                          }
                        >
                          查看签到
                        </AtButton>
                      ) : (
                        <AtButton
                          type="primary"
                          size="small"
                          onClick={() => onOpenModal(a._id)}
                        >
                          删除活动
                        </AtButton>
                      )}
                    </View>
                  </View>
                </View>
              </AtCard>
            </View>
          ))
        : null}
      <AtModal isOpened={openModal}>
        <AtModalHeader>删除活动</AtModalHeader>

        <AtModalContent>
          删除活动后，所有活动相关数据将被清除。 已报名的用户将无法看见该活动。
          您确定要删除么？
        </AtModalContent>

        <View style={{ display: "flex", justifyContent: "space-around" }}>
          <View style={{ width: "30vw" }}>
            <AtButton
              size="small"
              type="secondary"
              onClick={() => setOpenModal(false)}
            >
              取消
            </AtButton>
          </View>
          <View style={{ width: "30vw" }}>
            <AtButton
              size="small"
              type="primary"
              onClick={() => onDeleteActivity()}
              uploading={uploading}
            >
              确定
            </AtButton>
          </View>
        </View>
      </AtModal>
    </View>
  );

  return (
    <View>
      <AtMessage />
      {loading ? (
        <LoadingToast isOpened={loading} />
      ) : activities.length !== 0 ? (
        <ActivityList />
      ) : (
        <NoActivities />
      )}
    </View>
  );
};

export default EditActivity;
