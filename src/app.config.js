export default defineAppConfig({
  pages: [
    "pages/index/index",
    "pages/user/index",
    "pages/record/index",
    "pages/newActivity/newActivity",
    "pages/updateUser/index",
    "pages/singleActivity/index",
    "pages/application/index",
    "pages/attendance/index",
    "pages/allRecords/index",
    "pages/editActivity/index",
    "pages/userRecord/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#e0620d",
    navigationBarTitleText: "签到",
    navigationBarTextStyle: "black",
    backgroundColor: "#f9cb9c",
  },

  usingComponents: {},
  tabBar: {
    // custom: true,
    // color: "#f7c0dc",
    selectedColor: "#e0620d",
    // backgroundColor: "#fff",
    // borderStyle: "black",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
        iconPath: "./images/tabs/home.png",
        selectedIconPath: "./images/tabs/homeSelected.png",
      },
      {
        pagePath: "pages/user/index",
        text: "我的",
        iconPath: "./images/tabs/user.png",
        selectedIconPath: "./images/tabs/userSelected.png",
      },
      {
        pagePath: "pages/record/index",
        text: "记录",
        iconPath: "./images/tabs/record.png",
        selectedIconPath: "./images/tabs/recordSelected.png",
      },
    ],
  },
  permission: {
    "scope.userLocation": {
      desc: "获取当前位置信息用于描述",
    },
    // "scope.userFuzzyLocation": {
    //   desc: "获取当前位置信息用于描述",
    // },
  },
  requiredBackgroundModes: ["audio", "location"],

  // requiredPrivateInfos: ["chooseLocation", "getFuzzyLocation"],
  requiredPrivateInfos: ["getLocation", "chooseLocation"],
  defineConstants: {
    LOCATION_APIKEY: JSON.stringify("RDXBZ-6HPWL-RSQP5-EVSPS-PMLMS-ZXFLD"),
  },
});
