<style lang="less" scoped></style>
<script setup lang="ts">
import { reactive, ref, defineProps, defineComponent, onMounted } from "vue";
import bus from "./../../../../../../utils/eventbus/eventsbus";

const xTable = ref();
// 表单数据
const props = defineProps(["info"]);

bus.$on("toForm", (info: any) => {
  excel.methods.updatedAllList(info);
});

bus.$on("change-Plan", () => {
  excel.methods.changeList();
});

const excel = reactive({
  init: () => {
    // 先计算一下总价
    excel.methods.allTotal();
  },
  data: {
    // 标题
    titleName: {
      序号: "seq",
      品名: "name",
      数量: "num",
      单价: "price",
      总价: "total",
      备注: "remarks",
    },
    // 数据
    dataList: [
      {
        name: "BMS",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
      },
      {
        name: "EMS",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
      },
      // 集装箱
      {
        name: "10尺集装箱",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
      },
      {
        name: "空调系统",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
      },
      {
        name: "消防系统",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
      },
      {
        name: "运输费用",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
      },
      {
        name: "调试及运输费用",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
      },
    ],

    selectDataListIndex: 0,
    // 合计表
    dataFooter: {
      num: 0,
      price: 0,
      total: 0,
    },

    addEmptyData: {
      timer: new Date().getTime(),
      isOther: true,
      name: null,
      num: null,
      price: null,
      total: null,
      remarks: "",
    } as any,

    // 是否显示表格
    isShowExc: false,

    // 是否选择框之前被选中(联动的)
    isCheckLinkAge: false,

    // 选中的集合
    selectedArray: <any | null>[],

    // 合计数据
    totalArray: <string | any>["合计", null, null, null, null, 0],

    getAllInfo: {} as any,

    // 插入的信息
    insertInfo: {} as any,

    // 插槽的位置
    rowIndex: 2,

    // 方案
    planExc: false,

    selectIndex: <any>[],
  },
  methods: {
    // 计算单价
    priceChange(...p: any[]) {
      const [tableMap, other] = p;
      const { value } = other;
      const { rowIndex } = tableMap;
      const map = excel.data.dataList[rowIndex];
      map.price = Number(value);
      excel.methods.updateFooterEvent();
      excel.methods.allTotal();
    },

    // 计算数量
    numChange(...n: any[]) {
      const [tableMap, other] = n;
      const { value } = other;
      const { rowIndex } = tableMap;
      const map = excel.data.dataList[rowIndex];
      map.num = Number(value);
      excel.methods.updataNumber();
      excel.methods.allTotal();
    },

    // 获取到对应的清单
    getList: () => {},

    // 添加表格背景颜色
    footerCellClassName: ({ $rowIndex, columnIndex }: any) => {
      if (columnIndex === 1) {
        if ($rowIndex === 0) {
          return "col-blue";
        }
      }
    },

    // 销量合计
    countAmount: (row: any) => {
      let total = Number(row.num) * Number(row.price);
      return total;
    },

    // 更新数量
    updataNumber: () => {
      const $table = xTable?.value;
      if (!$table) return;
      $table.updateFooter();
    },

    // 在值发生改变时更新表尾合计
    updateFooterEvent: () => {
      const $table = xTable?.value;
      if (!$table) return;
      $table.updateFooter();
    },

    // 数量和  必须是选中的行列
    sumNum(list: any, field: string) {
      let count = 0;
      let otherCount = 0;
      // 分开进行计算
      xTable.value.getCheckboxRecords().map((i: any) => {
        if (!i.isOther) {
          if (i.name === i.name) {
            count += Number(i[field]);
          }
        } else {
          i.total = i.num * i.price;
          otherCount += Number(i[field]);
        }
      });

      return count + otherCount;
    },

    // 计算总数
    allTotal: () => {
      // 获取的数据价格汇总 遍历计算
      excel.data.dataList.map((item: any, index: number) => {
        let n = excel.data.dataList[index]["num"];
        let p = excel.data.dataList[index]["price"];
        if (!n || !p) return;
        excel.data.dataList[index]["total"] = n * p;
      });

      // 选中总数
      let allTotal = excel.methods.sumNum(excel.data.dataList, "total");

      // 全部的价格总和
      excel.data.dataFooter.total = allTotal;

      // 再次合计计算
      excel.methods.footerMethod();
    },

    // 重新计算
    computeAgain() {
      excel.methods.allTotal();
    },

    // 合计计算
    footerMethod: () => {
      // 合计数据
      const totalArray = excel.data.totalArray;

      excel.data.totalArray[
        totalArray.length - 1
      ] = `￥${excel.data.dataFooter.total}`;

      // 每次都返回新的信息
      return [excel.data.totalArray];
    },

    // 切换选中的行列  --- 全选的
    checkboxChangeEvent({ checked, records, reserves }: any) {
      const selectName = JSON.stringify(records);
      // 得到一开始所有的数据
      excel.data.selectedArray = JSON.parse(selectName);

      // 计算 数据总价
      excel.methods.computeAgain();

      // 刷新还是选中必选项
      excel.methods.selectDefaultMode();

      let a1 = false;
      let a2 = false;
      xTable.value.getCheckboxRecords().map((i: any) => {
        if (i.name === "空调系统") a1 = true;
        else a2 = true;
      });

      if (a1 && a2) excel.data.isCheckLinkAge = true;
      else excel.data.isCheckLinkAge = false;
      a1 = false;
      a2 = false;
    },

    // 单选中一项的问题
    checkboxChange(...c: any) {
      const checkInfo = { ...c };
      const { row, rowIndex } = Object.values(checkInfo)[0] as any;
      const { name, price, num, total } = row;
      const map = excel.data.dataList[rowIndex];
      map.num = num;
      map.price = price;

      excel.methods.computeAgain();

      excel.methods.selectDefaultMode();

      excel.methods.linkage(row, rowIndex, !excel.data.isCheckLinkAge);

      excel.data.isCheckLinkAge = !excel.data.isCheckLinkAge;
    },

    // 默认选中出基础的5项以外的数据
    selectDefaultMode() {
      let timer = setTimeout(() => {
        console.log(excel.data.dataList, "excel.data.dataList---");

        // 判断选中前几个
        let arr = Object.values(excel.data.dataList).filter(
          (i: any) => i?.name && i?.name.indexOf("隔离变压器") != -1
        );

        excel.data.selectIndex = arr;

        // 判断插槽在哪里
        arr[0] ? (excel.data.rowIndex = 8) : (excel.data.rowIndex = 7);

        // 选中
        excel.data.dataList.map((i: any, index: number) => {
          if (index <= (arr[0] ? 5 : 4)) {
            // 存放信息
            excel.data?.selectedArray.push(i);
            xTable?.value.setCheckboxRow([excel.data.dataList[index]], true);
          }
        });
        console.log(123121231, "123121231");
        clearTimeout(timer);
      });
    },

    // 选择联动
    linkage(row: any, rowIndex: number, isshow: boolean) {
      const { name } = row;
      if (
        name === "10尺集装箱" ||
        name === "20尺集装箱" ||
        name === "40尺集装箱"
      ) {
        xTable?.value.setCheckboxRow(
          [
            excel.data.dataList[rowIndex],
            excel.data.dataList[rowIndex + 1],
            excel.data.dataList[rowIndex + 2],
          ],
          isshow
        );
      } else if (name === "空调系统") {
        xTable?.value.setCheckboxRow(
          [
            excel.data.dataList[rowIndex - 1],
            excel.data.dataList[rowIndex],
            excel.data.dataList[rowIndex + 1],
          ],
          isshow
        );
      } else if (name === "消防系统") {
        xTable?.value.setCheckboxRow(
          [
            excel.data.dataList[rowIndex - 2],
            excel.data.dataList[rowIndex - 1],
            excel.data.dataList[rowIndex],
          ],
          isshow
        );
      }

      // 赋予最新的数组
      excel.data.selectedArray = xTable.value.getCheckboxRecords();
    },

    // 新增
    insertEvent() {
      const map = reactive({ ...excel.data.addEmptyData });
      // 插入最后一行数据
      xTable.value.insertAt(map, -1);

      // 添加到数组中
      excel.data.dataList.push(map);

      // 获取新增的临时数据
      const insertRecords = excel.data.dataList.filter(
        (row: any) => row._isNew
      )[0];

      excel.methods.selectDefaultMode();
    },

    // 删除---选中的
    removeEvent() {
      xTable.value.removeCheckboxRow();
    },

    // 更新全部表单
    updatedAllList: async (info: any) => {
      excel.methods.clearOldList();
      const { data, nbqName, number } = info;
      const { economic, practical } = data;
      excel.data.insertInfo = {
        nbq: {
          name: `${nbqName}(逆变器)`,
          num: number,
          price: 0,
          total: 0,
          remarks: "",
        },
        zj: {
          name: `支架`,
          num: economic.bracket_number,
          price: 0,
          total: 0,
          remarks: "",
        },
        gyh: {
          name: `高压盒`,
          num: economic.bracket_number,
          price: 0,
          total: 0,
          remarks: "",
        },
        dcmz: {
          name: `电池模组`,
          num: economic.battery_number,
          price: 0,
          total: 0,
          remarks: "",
        },
        hlg: {
          name: `汇流柜`,
          num: number,
          price: 0,
          total: 0,
          remarks: "",
        },
        glbyq: {
          name: `隔离变压器`,
          num: 1,
          price: 0,
          total: 0,
          remarks: "",
        },
      };
      await Object.values(excel.data.insertInfo).map(async (item: any) => {
        if (item.name === "隔离变压器" && !data.隔离变压器) return;
        const { row: newRow } = await xTable.value.insertAt(item);
        await xTable.value.setActiveCell(newRow);
        excel.data.dataList.unshift(newRow);
      });

      excel.data.getAllInfo = info;
      // 默认选中
      excel.methods.selectDefaultMode();
    },

    // 切换列表信息
    changeList() {
      const { data, nbqName, number } = excel.data.getAllInfo;
      const { economic, practical } = data;
      console.log(excel.data.getAllInfo, "获取到的所有信息~~~");

      excel.data.dataList.map((item: any) => {
        Object.values(excel.data.insertInfo).map((i: any) => {
          if (i.name === item.name) {
            switch (i.name) {
              case "支架":
                item.num = excel.data.planExc
                  ? economic.bracket_number
                  : practical.bracket_number;
                break;
              case "高压盒":
                item.num = excel.data.planExc
                  ? economic.bracket_number
                  : practical.bracket_number;
                break;
              case "高压盒":
                item.num = excel.data.planExc
                  ? economic.bracket_number
                  : practical.bracket_number;
                break;
              case "电池模组":
                item.num = excel.data.planExc
                  ? economic.battery_number
                  : practical.battery_number;
                break;
              default:
                break;
            }
          }
        });
      });
      // 切换显示方案
      bus.$emit("change-Plan-Electric", excel.data.planExc);

      excel.data.planExc = !excel.data.planExc;
    },

    // 清空之前的所有后添加的数据
    clearOldList() {
      if (excel.data.dataList.length <= 7) return;
      let arr = Object.values(excel.data.dataList).filter(
        (i: any) => i?.name && i?.name.indexOf("隔离变压器") != -1
      );
      excel.data.dataList.map((item: any, index: number) => {
        if (index <= (arr[0] ? 5 : 4)) {
          console.log(index, "index");
          xTable.value.remove(excel.data.dataList[index]);
        }
      });
    },

    // 保存
    saveEvent() {},

    // 更新数据
    updateData() {
      excel.data.dataList.push(excel.data.addEmptyData);
    },

    // 更新数据
    loadData() {},
  },
});

let timer = setTimeout(() => {
  // 默认选中必选的信息
  // excel.methods.selectDefaultMode();
  // 初始化默认事件
  excel.init();

  clearTimeout(timer);
});

onMounted(() => {});

defineExpose({
  excel,
});
</script>

<template>
  <div class="exc">
    <vxe-toolbar export>
      <template #buttons>
        <vxe-button @click="excel.methods.insertEvent">新增</vxe-button>
        <vxe-button @click="excel.methods.removeEvent">删除</vxe-button>
        <vxe-button @click="excel.methods.saveEvent">保存</vxe-button>
      </template>
    </vxe-toolbar>
    <vxe-table
      border
      align="center"
      show-header-overflow
      show-overflow
      show-footer
      class="mytable-style"
      ref="xTable"
      highlight-hover-row
      :footer-method="excel.methods.footerMethod"
      :footer-cell-class-name="excel.methods.footerCellClassName"
      :edit-config="{ trigger: 'click', mode: 'row' }"
      :data="excel.data.dataList"
      :checkbox-config="{
        checkMethod: () => {
          return true;
        },
        highlight: true,
      }"
      @checkbox-change="excel.methods.checkboxChange"
      @checkbox-all="excel.methods.checkboxChangeEvent"
    >
      <!-- 多选框 -->
      <vxe-table-column
        align="center"
        type="checkbox"
        width="65"
      ></vxe-table-column>

      <!-- 序号 -->
      <vxe-table-column type="seq" title="序号" width="60"></vxe-table-column>

      <!-- 单个表格进行插槽处理  集装箱 -->
      <vxe-column field="name" title="品名" width="200" show-overflow>
        <template #default="{ row, rowIndex }">
          <template v-if="rowIndex === excel.data.rowIndex">
            <vxe-select
              v-model="excel.data.dataList[excel.data.rowIndex].name"
              transfer
            >
              <vxe-option value="10尺集装箱" label="10尺集装箱"></vxe-option>
              <vxe-option value="20尺集装箱" label="20尺集装箱"></vxe-option>
              <vxe-option value="40尺集装箱" label="40尺集装箱"></vxe-option>
            </vxe-select>
          </template>
          <template v-else>
            <!-- <p>{{ row.name }}</p> -->
            <vxe-input v-model="row.name"></vxe-input>
          </template>
        </template>
      </vxe-column>

      <!-- 数量 -->
      <vxe-table-column
        field="num"
        title="数量"
        min-width="50"
        :edit-render="{
          name: '$input',
          immediate: true,
          props: { type: 'number' },
          events: {
            change: excel.methods.numChange,
          },
        }"
      ></vxe-table-column>

      <!-- 单价 -->
      <vxe-table-column
        field="price"
        title="单价"
        :edit-render="{
          name: '$input',
          immediate: true,
          props: { type: 'number' },
          events: {
            change: excel.methods.priceChange,
          },
        }"
        width="150"
      ></vxe-table-column>

      <!-- 总价 -->
      <vxe-table-column field="total" title="总价" width="140">
        <template #default="{ row }">
          <span>{{ excel.methods.countAmount(row) }}</span>
        </template>
      </vxe-table-column>

      <!-- 备注 -->
      <vxe-table-column
        field="remarks"
        title="备注"
        min-width="200"
        :edit-render="{
          name: '$input',
          immediate: true,
          props: { type: 'string' },
          events: {
            change: () => {},
          },
        }"
      ></vxe-table-column>
    </vxe-table>
  </div>
</template>
