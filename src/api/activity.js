import axios from "axios";
import { TaroAdapter } from "axios-taro-adapter";
import { baseUrl } from "../utils/baseUrl";

const instance = axios.create({
  baseURL: baseUrl,
  timeout: 3000,
  adapter: TaroAdapter, // add this line，添加这一行使用taroAdapter
});

export const get = async () => {
  try {
    const response = await instance.get(`/api/activities`);
    return response.data;
  } catch (error) {
    return error.response;
  }
};
export const getSigned = async (data) => {
  try {
    const response = await instance.post(`/api/activities/signedup`, data);
    return response.data;
  } catch (error) {
    return error.response;
  }
};
export const getSingle = async (id, data) => {
  try {
    const response = await instance.post(
      `/api/activities/singleActivity/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    return error.response;
  }
};
export const signup = async (data) => {
  try {
    const response = await instance.post(`/api/attendances`, data);
    return response;
  } catch (error) {
    return error;
  }
};

export const getAttendance = async (id) => {
  try {
    const response = await instance.get(`/api/attendances/${id}`);
    return response;
  } catch (error) {
    return error;
  }
};

export const attendance = async (id, data) => {
  try {
    const response = await instance.put(`/api/attendances/${id}`, data);
    return response;
  } catch (error) {
    return error;
  }
};

export const getRecord = async (data) => {
  try {
    const response = await instance.post(
      `/api/attendances/active/record`,
      data
    );
    return response;
  } catch (error) {
    return error;
  }
};
