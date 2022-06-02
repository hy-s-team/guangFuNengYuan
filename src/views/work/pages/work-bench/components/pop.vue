<style scoped lang="less">
@import "../../../../../assets/less/work/workbench/pop.less";
</style>

<script setup lang="ts">
// @ts-ignore
import Exc from "./components/from.vue";
import { defineProps, onMounted, reactive, ref } from "vue";
import { getAllNBQ, getCapacity } from "../../../../../assets/api/plan/plan";
import { ExcelService } from "../../../../../utils/exportToExcel";
import bus from "./../../../../../utils/eventbus/eventsbus";
import { ElMessage } from "element-plus";
type excelMap = {
  名称: string;
  序号: string;
  类型: string;
  规格: string;
  数量: number;
  价格: number;
  总价合计: string;
}[];

// const props = defineProps(["work"]);
// 弹窗菜单
onMounted(() => {
  // 显示添加方案的菜单
  bus.$on("showPlanMenu", (isShow: boolean, msg = "新建方案") => {
    compute.data.isShowAddMeun = isShow;
    if (msg) compute.data.popTitleName = msg;
  });
  compute.init();
});

const exc = ref();
// 拿到父组件资源

const compute = reactive({
  init: () => {
    // 获取所有的逆变器
    compute.methods.getAllNBQ();
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
      data: <any>[],
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
          let inverter_num = Number(compute.data.nbqNumber);
          let res: any = await getCapacity(capacity, inverter_id, inverter_num);
          const { msg, success, data } = res;
          compute.data.success = success;
          console.log("数据请求是否成功~~~", success);
          if (!data) {
            compute.data.msg = msg;
          } else {
            compute.data.msg = data;
          }

          // 弹窗是否成功!
          if (success)
            bus.$emit("isShowForm-fn", {
              isShow: true,
              data: data,
              nbqName: compute.coms.machineModel.value,
              number: Number(compute.data.nbqNumber),
            }) && ElMessage("输入正确正在加载表格数据!");
          else ElMessage.error("输入信息有错或不批配,请重新输入!");
        },
      },
    },
  },

  // 数据
  data: {
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
    // 提交后端反馈信息
    msg: <undefined | string | any>undefined,
    // 电量获得预期
    batteryMsg: <any | undefined | string | object>undefined,
    // 是否成功
    success: false,
    // 方案名称
    planName: "",
    // 逆变器用途
    effect: "工商",
    // 逆变器类型
    nbqType: "光储一体机",
    // 逆变器个数
    nbqNumber: 1,

    // 是否显示表单等数据
    isShowPopContent: false,

    // 添加方案菜单 弹窗
    isShowAddMeun: false,

    // 方案名称
    popTitleName: "新建方案",

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
        s.exportAsExcelFile(compute.data.transJSON, compute.data.planName);
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

  methods: {
    /** 获取所有的设备 */
    getAllNBQ: async () => {
      let res: any = await getAllNBQ();
      if (!res) return;
      let datas = res?.data;
      datas?.map((data: any) => {
        compute.methods.addMachineModel(data);
      });
      console.log("所有逆变器信息-->", datas);
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
        inverter_type,
      } = data;
      map["value"] = inverter_name;
      map["label"] = inverter_name;
      map[inverter_name] = {
        inverter_id: inverter_id,
        inverter_lower_limit: inverter_lower_limit,
        inverter_output_power: inverter_output_power,
        inverter_price: inverter_price,
        inverter_up_limit: inverter_up_limit,
        inverter_type: inverter_type,
      };
      compute.coms.machineModel.data.push(map);
    },
  },
});
</script>

<template>
  <div class="pop-menu" v-show="compute.data.isShowAddMeun">
    <div class="menu">
      <div class="menu-up">
        <div class="title">
          <div>{{ compute.data.popTitleName }}</div>
          <i
            class="iconfont icon-guanbi"
            @click="
              () => {
                compute.data.isShowAddMeun = false;
              }
            "
          ></i>
        </div>

        <div class="attr">
          <div class="attr-title">
            <div>基本属性</div>
          </div>
          <div class="attr-info">
            <!-- 方案名称 -->
            <div class="name">
              <p>方案名称:</p>
              <el-input
                class="input"
                v-model="compute.data.planName"
                placeholder="请输入"
              />
            </div>
            <!-- 用途 -->
            <div class="effect">
              <p>用途:</p>
              <el-radio-group v-model="compute.data.effect" class="radio">
                <el-radio label="户用" size="small">户用</el-radio>
                <el-radio label="工商" size="small">工商</el-radio>
              </el-radio-group>
            </div>
            <!-- 负载 -->
            <div class="load">
              <p>负载:</p>
              <div>三项负载</div>
            </div>
          </div>
        </div>

        <!-- 逆变器 -->
        <div class="nbq">
          <div class="nbq-title">
            <div>逆变器</div>
          </div>

          <div class="nbq-info">
            <div class="type">
              <p>类型:</p>
              <el-radio-group v-model="compute.data.nbqType" class="radio">
                <el-radio label="储能逆变器" size="small">储能逆变器</el-radio>
                <el-radio label="光储一体机" size="small">光储一体机</el-radio>
              </el-radio-group>
            </div>
            <div class="kw">
              <p>功率(KW):</p>
              <el-tree-select
                placeholder="请选择"
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
            <div class="num">
              <p>数量(个)</p>
              <el-input v-model="compute.data.nbqNumber" placeholder="" />
            </div>
          </div>
        </div>

        <!-- 电量 -->
        <div class="electric">
          <div class="electric-title">
            <div>电量</div>
          </div>
          <div class="electric-info">
            <div class="needs">
              <p>需求电量:</p>
              <el-input
                v-model="compute.coms.energy.value"
                placeholder="请输入发电量"
              >
                <template #append>KWH</template>
              </el-input>
            </div>
          </div>
        </div>
      </div>

      <div class="menu-lower">
        <div class="footer">
          <div></div>
          <div class="footer-fn">
            <el-button @click="() => {}">取消</el-button>
            <el-button
              type="primary"
              @click="
                () => {
                  compute.data.methods.exportExcel();
                }
              "
              >导出表格</el-button
            >
            <el-button
              type="primary"
              @click="
                () => {
                  compute.coms.sub.methods.subInfo();
                  // 进入即可消失掉
                  compute.data.isShowAddMeun = false;
                }
              "
              >方案生成</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
