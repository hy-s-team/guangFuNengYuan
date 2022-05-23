import axios from "axios";
import QS from "qs";
import { baseUrl } from "../../../constant/index";
const newAxios = axios.create({
  baseURL: baseUrl,
  timeout: 100000,
  headers: {
    get: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    } as any,
    post: {
      "Content-Type": "application/json;charset=utf-8",
    } as any,
  },
});

// 请求返回提示
newAxios.interceptors.response.use((res) => {
  const { data } = res;
  if (Number(data.errorCode) === 200) {
    console.log(200, "页面200");
  } else {
    return res;
  }
});

export const get = function (url: string, params?: any) {
  return new Promise((resolve, reject) => {
    newAxios
      .get(url, { params })
      .then((res: any) => {
        resolve(res.data);
      })
      .catch((err: any) => {
        reject(err.data);
      });
  });
};

export const post = function (url: string, params?: any) {
  return new Promise((reslove, rejcet) => {
    newAxios
      .post(url, QS.stringify(params))
      .then((res: any) => {
        reslove(res.data);
      })
      .catch((err: any) => {
        rejcet(err.data);
      });
  });
};
