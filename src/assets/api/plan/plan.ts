import { get, post } from "../../lib/axios";

/**
 * 根据逆变器以及发电量获得预期
 */
export const getCapacity = (
  capacity: number,
  inverter_id: number,
  inverter_num: number
) => {
  return get("/inverter/getCapacity", { capacity, inverter_id, inverter_num });
};

/*
  获取所有逆变器信息
*/
export const getAllNBQ = () => {
  return get("/inverter/getAll");
};

/*
  添加逆变器
*/
export const addNBQ = (map: {
  inverter_lower_limit: "string";
  inverter_name: "string";
  inverter_output_power: "string";
  inverter_price: "string";
  inverter_up_limit: "string";
}) => {
  return post("/inverter/create", map);
};
