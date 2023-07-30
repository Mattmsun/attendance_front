import React from "react";
import { AtToast } from "taro-ui";
import loadingIcon from "../images/icons/loading.png";

const LoadingToast = ({ isOpened }) => {
  return (
    <AtToast isOpened={isOpened} text={"加载中"} image={loadingIcon}></AtToast>
  );
};

export default LoadingToast;
