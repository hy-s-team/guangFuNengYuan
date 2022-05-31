<style lang="less" scoped></style>
<script setup lang="ts">
import { lv } from "element-plus/lib/locale";
import { reactive, ref, defineProps, defineComponent } from "vue";
import { getAllNBQ } from "../../../../../../assets/api/plan/plan";
import bus from "./../../../../../../utils/eventbus/eventsbus";

const xTable = ref();
const excel = reactive({
  init: () => {
    // 获取所有机器信息
    excel.methods.getAll();

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
        num: 10,
        price: 85,
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
        name: "逆变器",
        num: 10,
        price: 15,
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
        name: "测试及运输费用",
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
      timer: new Date(),
      name: "",
      num: 10,
      price: 10,
      total: "",
      remarks: "",
    } as any,

    // 所有机器的信息
    allmachineInfo: <any>[],

    // 是否显示表格
    isShowExc: false,

    isCheckLinkAge: false,

    // 选中的集合
    selectedArray: <any | null>[],

    // 合计数据
    totalArray: <string | any>["合计", null, null, null, null, 0],
  },
  methods: {
    // 计算单价
    priceChange(...p: any[]) {
      console.log(p, "a---");
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
      console.log(n, "n");
      const [tableMap, other] = n;
      const { value } = other;
      const { rowIndex } = tableMap;
      const map = excel.data.dataList[rowIndex];
      map.num = Number(value);
      excel.methods.updataNumber();
      excel.methods.allTotal();
    },

    // 获取所有的机器信号
    getAll: async () => {
      let res: any = await getAllNBQ();
      if (!res) return;
      let datas = res?.data;
      datas.map((data: any) => {
        excel.data.allmachineInfo.push(data);
        // console.log(excel.data.allmachineInfo, "excel.allmachineInfo");
      });
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

      console.log(
        xTable.value.getCheckboxRecords(),
        "xTable.value.getCheckboxRecords()"
      );

      excel.data.dataList.map((item: any) => {
        xTable.value.getCheckboxRecords().map((i: any) => {
          if (item.name === i.name) {
            console.log(item, "item*----");
            count += Number(item[field]);
          }
        });
      });
      console.log(count, "count---");
      return count;
    },

    // 计算总数
    allTotal: () => {
      // 获取的数据价格汇总 遍历计算
      excel.data.dataList.map((item: any, index: number) => {
        let n = excel.data.dataList[index]["num"];
        let p = excel.data.dataList[index]["price"];
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
      // console.log(checked ? "勾选事件" : "取消事件");
      // console.log("当前选中的数据：" + records);
      // console.log("翻页时其他页的数据：" + reserves);
      const selectName = JSON.stringify(records);
      // 得到一开始所有的数据
      excel.data.selectedArray = JSON.parse(selectName);

      // 计算数据
      excel.methods.computeAgain();
    },

    // 单选中一项的问题
    checkboxChange(...c: any) {
      const checkInfo = { ...c };
      const { row, rowIndex } = Object.values(checkInfo)[0] as any;
      const { name, price, num, total } = row;

      console.log(Object.values(checkInfo)[0], "Object.values(checkInfo)[0]");

      const map = excel.data.dataList[rowIndex];
      map.num = num;
      map.price = price;

      // 联动
      excel.methods.linkage(!excel.data.isCheckLinkAge, name);
      excel.data.isCheckLinkAge = !excel.data.isCheckLinkAge;

      excel.methods.computeAgain();
    },

    // 默认选中出基础的5项以外的数据
    selectDefaultMode() {
      console.log(excel.data.dataList, "excel.data.dataList");
      let arr = <any>[];
      excel.data.dataList.map((i: any, index: number) => {
        if (index >= 5) {
          // 存放信息
          excel.data?.selectedArray.push(i);
          arr.push(excel.data.dataList[index]);
        }
      });
      xTable?.value.setCheckboxRow([...arr], true);
      console.log("执行", "");
    },

    // 选择联动
    linkage(isSelected: boolean, name: string) {
      if (
        name === "10尺集装箱" ||
        name === "20尺集装箱" ||
        name === "40尺集装箱" ||
        name === "空调系统" ||
        name === "消防系统"
      ) {
        xTable?.value.setCheckboxRow(
          [
            excel.data.dataList[2],
            excel.data.dataList[3],
            excel.data.dataList[4],
          ],
          isSelected
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

    // 删除
    removeEvent() {},

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
  excel.methods.selectDefaultMode();
  // 初始化默认事件
  excel.init();

  clearTimeout(timer);
});

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
      <vxe-column field="name" title="品名" width="130" show-overflow>
        <template #default="{ row, rowIndex }">
          <template v-if="rowIndex === 2">
            <vxe-select v-model="excel.data.dataList[2].name" transfer>
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
        min-width="100"
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
