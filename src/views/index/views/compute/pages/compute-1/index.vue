<style scoped lang="less">
@import "../../../../../../assets/less/compute/compute.less";
</style>

<script setup lang="ts">
import { reactive, ref } from "vue";
import {
  getAllNBQ,
  getCapacity,
} from "./../../../../../../assets/api/compute/compute";
import { ExcelService } from "../../../../../../utils/exportToExcel";
import Exc from "./components/from.vue";
type excelMap = {
  名称: string;
  序号: string;
  类型: string;
  规格: string;
  数量: number;
  价格: number;
  总价合计: string;
}[];
compoents: {
  Exc;
}
/*
    电能计算 总对象
      子组件属性
        本组件
*/
const exc = ref();
const compute = reactive({
  init: () => {
    // 获取所有的逆变器
    compute.methods.getAllNBQ();
  },
  methods: {
    getAllNBQ: async () => {
      let res: any = await getAllNBQ();
      if (!res) return;
      let datas = res?.data;
      datas.map((data: any) => {
        compute.methods.addMachineModel(data);
      });
      console.log(datas, "datas所有逆变器");
    },

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
  // 内部组件
  coms: {
    // 电量 kwh
    energy: {
      value: <number | any>undefined,
      methods: {},
    },
    // 逆变器
    machineModel: {
      value: "",
      id: "",
      data: [] as any,
      methods: {
        // 选择机器型号
        select: (name: string) => {
          compute.coms.machineModel.data.map((d: any) => {
            if (!d[name]) return;
            const id = d[name].inverter_id;
            compute.coms.machineModel.id = id;
            compute.coms.machineModel.value = name;
          });
        },
      },
    },
    // 提交
    sub: {
      methods: {
        // 提交发电需求以及信号信息
        subInfo: async () => {
          let capacity = compute.coms.energy.value;
          let inverter_id = Number(compute.coms.machineModel.id);
          let res: any = await getCapacity(capacity, inverter_id);
          console.log(res, "res-subInfo");
          const { msg, success, data } = res;
          compute.data.success = success;

          if (!data) {
            compute.data.msg = msg;
          } else {
            compute.data.msg = data;
          }
        },
      },
    },
  },
  // 数据
  data: {
    methods: {
      // 导出表格
      exportExcel: () => {
        // 子组件信息
        let excel = exc.value.excel;
        compute.data.methods.inputJSON(excel);
        compute.data.methods.getJSON(excel);
        compute.data.methods.addFooterJSON(excel);
        // 导出excel
        const s = new ExcelService();
        s.exportAsExcelFile(compute.data.transJSON, "gf");
        console.log(compute.data.transJSON, "compute.data.transJSON");
        compute.data.transJSON = [];
      },
      // 转换JSON
      getJSON: (excel: any) => {
        const { titleName } = excel;
        let newTitleName = compute.data.methods.reverseMap(titleName);
        return compute.data.json.map((equs: any) => {
          let map: any = {};
          Object.keys(equs).map((equ: any) => {
            let equV = equs[equ];
            let name = newTitleName[equ];
            map[name] = equV;
          });
          compute.data.transJSON.push(map);
        });
      },
      // 尾部补充
      addFooterJSON(excel: any) {
        const { dataFooter } = excel;
        const { num, price, total } = dataFooter;
        let totalMap = {
          序号: "合计",
          类型: "",
          规格: "",
          数量: num,
          价格: price,
          总价合计: total,
        };
        return compute.data.transJSON.push(totalMap);
      },
      // 导入数据---处理顺序
      inputJSON: (excel: any) => {
        const { dataList, titleName } = excel;
        compute.data.methods.initJSON(titleName);
        dataList.map((item: any, index: number) => {
          // let excJson: { [key: string]: any } = {};
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
          compute.data.json.push(excJson);
        });
      },
      // 初始化处理数据
      initJSON: (map: any) => {
        compute.data.fromJSON = compute.data.methods.reverseMap(map);
      },
      // 颠倒map
      reverseMap: (map: any) => {
        let newMap = Object.keys(map).reduce((acc: any, key: any) => {
          acc[map[key]] = key;
          return acc;
        }, {});
        return newMap;
      },
    },
    // 导出的表单数据
    json: [] as excelMap,

    fromJSON: undefined,
    // 最终json
    transJSON: [] as excelMap,
    // 提交后端反馈信息
    msg: <undefined | string | any | object>undefined,
    // 电量获得预期
    batteryMsg: <any | undefined | string | object>undefined,
    // batteryMsg: {
    //   // 实用型电池数量
    //   battery_number: "",
    //   // 支架数量
    //   bracket_number: "",
    //   // 实用型实际发电量
    //   capacity: "",
    //   // 经济型电池数量
    //   economic_battery_number: "",
    //   // 经济型实际发电量
    //   economic_capacity: "",
    // } as any,
    success: false,
  },
});
compute.init();
</script>

<template>
  <div class="compute">
    <div class="title">
      <div class="'menu"></div>
    </div>
    <div class="content">
      <div class="energy">
        <!-- 需求发电量 -->
        <div class="quantity">
          <p>需求发电量:</p>
          <el-input v-model="compute.coms.energy.value" placeholder="发电量" />
        </div>

        <!-- 变电器型号 -->
        <div class="type">
          <p>逆变器型号:</p>
          <el-tree-select
            placeholder="型号"
            v-model="compute.coms.machineModel.value"
            :data="compute.coms.machineModel.data"
            check-strictly
            @change="
              (id:string) => {
                compute.coms.machineModel.methods.select(id);
              }
            "
          />
        </div>

        <!-- 提交请求 -->
        <div class="sub">
          <p>提交需求:</p>
          <el-button
            @click="
              () => {
                compute.coms.sub.methods.subInfo();
              }
            "
            >提交</el-button
          >
        </div>

        <div class="export">
          <p>导出表格:</p>
          <el-button
            @click="
              () => {
                compute.data.methods.exportExcel();
              }
            "
            >导出</el-button
          >
        </div>
      </div>

      <div class="form">
        <div class="form-content">
          <div class="form-msg">
            <div :style="compute.data.success ? 'color:white' : 'color:red'">
              <div class="err" v-show="!compute.data.success">
                {{ compute.data.msg }}
              </div>
              <div class="succ" v-show="compute.data.success">
                <p>
                  经济型电池数量:{{
                    compute.data.msg?.economic_battery_number
                      ? compute.data.msg?.economic_battery_number
                      : "无法计算"
                  }}
                </p>
                <p>
                  经济型实际发电量:{{
                    compute.data.msg?.economic_capacity
                      ? compute.data.msg?.economic_capacity
                      : "无法计算"
                  }}
                </p>
              </div>
            </div>
          </div>
          <Exc ref="exc"></Exc>
        </div>
      </div>
    </div>
    <div class="footer"></div>
  </div>
</template>
