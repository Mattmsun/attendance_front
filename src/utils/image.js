import Taro from "@tarojs/taro";

const backend = "http://localhost:8000";
export const uploadImage = (filePath, formData, api) => {
  // setUploading(true);

  return Taro.uploadFile({
    url: `${backend}${api}`,
    filePath,
    name: "image",
    formData,
    success(res) {
      // if (res.statusCode === 200) handleAtMessage("成功添加活动", "success");
      // else handleAtMessage("添加失败", "error");
      console.log(res);
      //do something
    },
    fail: function (err) {
      // handleAtMessage("添加失败", "error");
      console.log(err);
    },
    complete: () => {
      // setUploading(false);
    },
  });
};
