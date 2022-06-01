<style scoped lang="less">
@import "../../../../../assets/less/work/workbench/plan/plan.less";
</style>

<script setup lang="ts">
// @ts-ignore
import Exc from "./components/from.vue";
import { defineProps, reactive, ref } from "vue";
import { getAllNBQ, getCapacity } from "../../../../../assets/api/plan/plan";
import { ExcelService } from "../../../../../utils/exportToExcel";
import bus from "./../../../../../utils/eventbus/eventsbus";
type excelMap = {
  名称: string;
  序号: string;
  类型: string;
  规格: string;
  数量: number;
  价格: number;
  总价合计: string;
}[];

// 显示表格信息
bus.$on("isShowForm-fn", (info: any) => {
  const { isShow, data, nbqName, machineModel } = info;
  compute.data.isShowForm = isShow;
  compute.data.planData = data;
  compute.data.getInfo = info;
  bus.$emit("toForm", info);
});

bus.$on("change-Plan-Electric", (isEconomic: boolean) => {
  compute.data.isEconomic = isEconomic;
});

const exc = ref();

const compute = reactive({
  init: () => {
    // 获取所有的逆变器
    // compute.methods.getAllNBQ();
  },
  methods: {
    /** 获取所有的设备 */
    getAllNBQ: async () => {
      let res: any = await getAllNBQ();
      if (!res) return;
      let datas = res?.data;
      datas.map((data: any) => {
        // compute.methods.addMachineModel(data);
      });
      console.log(datas, "datas所有逆变器");
    },

    /* 解构设备信息 */
    addMachineModel: (data: any) => {
      let map: any = {};
      const {
        inverter_id,
        inverter_lower_limit,
        inverter_name,
        inverter_output_power,
        inverter_price,
        inverter_up_limit,
      } = data;
      map["value"] = inverter_name;
      map["label"] = inverter_name;
      map[inverter_name] = {
        inverter_id: inverter_id,
        inverter_lower_limit: inverter_lower_limit,
        inverter_output_power: inverter_output_power,
        inverter_price: inverter_price,
        inverter_up_limit: inverter_up_limit,
      };
      compute.coms.machineModel.data.push(map);
    },
  },
  // 数据
  data: {
    isEconomic: true,
    // 导出的表单数据
    json: [] as excelMap,
    // 刚加载JSON
    fromJSON: undefined,
    // 最终json
    transJSON: <any>[],
    // 表格title
    excelTitle: ["光伏能源设备配置单", "", "", "", "", ""],
    // 表格列表
    excelList: ["序号", "品名", "数量", "单价", "总价", "备注"],
    // 表格说明
    excExplain:
      "说明: 1.质保期:5年; 2税票及税率:此报价已包含13%增值税专用发票和运费; 3.生效日期:2022-3-5 4.付款方式:预付; 5.送货方式:送至需XXXXXXXXXXXX; 6.包装方式:原包装",

    // 提交后端反馈信息
    msg: <undefined | string | any>undefined,

    // 是否显示表单
    isShowForm: false,

    // 后台返回的方案信息
    planData: {
      economic: {
        battery_number: 0,
        bracket_number: null,
        capacity: 0,
        errmsg: "",
      },
      inverter_number: 0,
      inverter_output_power: 0,
      practical: {
        battery_number: 0,
        bracket_number: 0,
        capacity: 0,
        errmsg: null,
      },
    },

    // 获取的信息
    getInfo: {} as any,

    methods: {
      // 导出表格
      exportExcel: () => {
        // 子组件信息
        let excel = exc.value.excel;
        compute.data.methods.inputJSON(excel);
        compute.data.methods.getJSON(excel);
        compute.data.methods.addFooterJSON(excel);
        // 设置新的序号
        compute.data.methods.setNewSeq();
        console.log(compute.data.transJSON, "compute.data.transJSON");

        // return;
        // 导出excel
        const s = new ExcelService();
        s.exportAsExcelFile(compute.data.transJSON, "");
      },

      // 转换JSON
      getJSON: (excel: any) => {
        const { titleName } = excel.data;
        let newTitleName = compute.data.methods.reverseMap(titleName);
        compute.data.json.map((equs: any) => {
          let map: any = {};
          Object.keys(equs).map((equ: any) => {
            let equV = equs[equ];
            let name = newTitleName[equ];
            map[name] = equV;
          });
          let arr = compute.data.methods.jsonSort(map);
          compute.data.transJSON.push(arr);
        });
      },

      // 数据排序---第三步
      jsonSort(map: any) {
        let arr: string[] = [];
        compute.data.excelList.map((t: string) => {
          if (!map[t]) return;
          arr.push(map[t]);
        });
        return arr;
      },

      // 尾部补充
      addFooterJSON(excel: any) {
        const { dataFooter } = excel.data;
        const { num, price, total } = dataFooter;
        let totalMap = ["合计", "", "", "", total];
        compute.data.transJSON.push(totalMap);
      },

      // 导入数据---处理顺序---第二步
      inputJSON: (excel: any) => {
        // 导入数据的时候将之前的清空
        compute.data.methods.resetJSON();
        // 列表数据、选中的数据
        const { dataList, titleName, selectedArray } = excel.data;

        // 颠倒名称
        compute.data.fromJSON = compute.data.methods.reverseMap(titleName);
        // 设备列表
        dataList.map((item: any, index: number) => {
          selectedArray.map((sel: any) => {
            if (item.name !== sel.name || item.num !== sel.num) return;
            let excJson: any = {};
            let seq: number = index + 1;
            Object.keys(titleName).map((title) => {
              let t = compute.data.fromJSON;
              if (!t || t === undefined) return;
              let e = titleName[title];
              let v = item[e];
              if (title === "序号") {
                excJson[e] = seq;
              } else {
                excJson[e] = v;
              }
            });
            // 第一段JSON文件
            compute.data.json.push(excJson);
            // 去重
            let newArr = <any>[];
            compute.data.json.forEach((i: any) => {
              newArr.some((item: any) => item.seq == i.seq)
                ? ""
                : newArr.push(i);
            });
            compute.data.json = newArr;
          });
        });
      },

      // 重新设置序号
      setNewSeq() {
        compute.data.transJSON.map((item: any, num: number) => {
          item.map((i: any, index: number) => {
            if (index === 0 && typeof i === "number") {
              item[0] = num - 1;
            } else {
              return;
            }
          });
        });
      },

      // 清空JSON---第一步
      resetJSON() {
        compute.data.transJSON = [];
        compute.data.json = [];
        compute.data.transJSON.push(compute.data.excelTitle);
        compute.data.transJSON.push(compute.data.excelList);
      },

      // 颠倒map---工具
      reverseMap: (map: any) => {
        let newMap = Object.keys(map).reduce((acc: any, key: any) => {
          acc[map[key]] = key;
          return acc;
        }, {});
        return newMap;
      },
    },
  },
});
compute.init();
</script>

<template>
  <div class="plan-info" v-show="compute.data.isShowForm">
    <div class="info-title">
      <div
        @click="
          () => {
            compute.data.isShowForm = false;
            bus.$emit('showPlanMenu', false);
          }
        "
      >
        返回
      </div>
      <div>项目名称xxxxxxx</div>
      <div class="right">
        <div
          @click="
            () => {
              bus.$emit('change-Plan');
            }
          "
        >
          方案切换
        </div>
        <div
          @click="
            () => {
              bus.$emit('showPlanMenu', true, '修改方案');
            }
          "
        >
          修改方案
        </div>
        <div>分享</div>
      </div>
    </div>
    <div class="content">
      <div class="form">
        <div class="form-title">
          <p>光伏能源设备配置单</p>
        </div>
        <div class="form-content">
          <Exc ref="exc" :info="compute"></Exc>
          <div class="exc-info">
            <!-- 表格信息 -->
            <div class="info-electric">
              <div>
                <div class="succ">
                  <p>
                    {{
                      `${
                        compute.data.isEconomic ? "经济" : "实用"
                      }型实际发电量:${
                        compute.data.planData
                          ? `${
                              compute.data.planData?.inverter_output_power
                                ? compute.data.planData?.inverter_output_power
                                : "无法计算"
                            }KW/${
                              compute.data.isEconomic
                                ? compute.data.planData?.economic.capacity?.toFixed(
                                    2
                                  )
                                  ? compute.data.planData?.economic.capacity?.toFixed(
                                      2
                                    )
                                  : "无法计算"
                                : compute.data.planData?.practical.capacity?.toFixed(
                                    2
                                  )
                                ? compute.data.planData?.practical.capacity?.toFixed(
                                    2
                                  )
                                : "无法计算"
                            }KWH`
                          : `无数据`
                      }`
                    }}
                  </p>
                  <p>
                    {{
                      `提示信息:${
                        compute.data.isEconomic
                          ? compute.data.planData?.economic.errmsg
                            ? compute.data.planData?.economic.errmsg
                            : ""
                          : compute.data.planData?.practical.errmsg
                          ? compute.data.planData?.practical.errmsg
                          : ""
                      }`
                    }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 表格说明 -->
            <el-input
              class="exc-explain-input"
              resize="none"
              v-model="compute.data.excExplain"
              :autosize="{ minRows: 2, maxRows: 8 }"
              type="textarea"
              placeholder="Please input"
            />

            <div class="info-explain"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
