import axios from "axios";
import { TaroAdapter } from "axios-taro-adapter";
import { baseUrl } from "../utils/baseUrl";

const instance = axios.create({
  baseURL: baseUrl,
  timeout: 3000,
  adapter: TaroAdapter, // add this line，添加这一行使用taroAdapter
});

export const getApplicant = async () => {
  try {
    const response = await instance.get(`/api/attendances/inactive`);
    return response.data;
  } catch (error) {
    return error.response;
  }
};

export const approveApplicant = async (id, data) => {
  try {
    const response = await instance.put(`/api/attendances/status${id}`, data);
    return response;
  } catch (error) {
    return error;
  }
};

export const getAllAttendance = async (data) => {
  try {
    const response = await instance.post(`/api/attendances/users`, data);
    return response;
  } catch (error) {
    return error;
  }
};
export const deleteActivity = async (id, data) => {
  try {
    const response = await instance.delete(`/api/activities/${id}`, {
      data,
    });
    return response;
  } catch (error) {
    return error;
  }
};
export const getUsers = async (data) => {
  try {
    const response = await instance.post(`/api/users/names`, data);
    return response;
  } catch (error) {
    return error;
  }
};
