import Taro from "@tarojs/taro";

export const handleAtMessage = (message, type) => {
  Taro.atMessage({
    message: message,
    type: type,
  });
};
