import { get, post } from "./../../lib/axios";

/**
 * 提交需求电量和变电器信号
 */
export const powerDemand = (map: {
  electricQuantity: number;
  transformerType: string;
}) => {
  return get("/3d/workshop/tree");
};
