<style lang="less" scoped></style>
<script setup lang="ts">
import { lv } from "element-plus/lib/locale";
import { reactive, ref, defineProps, defineComponent } from "vue";
import { getAllNBQ } from "../../../../../../assets/api/plan/plan";
const xTable = ref();
const excel = reactive({
  init: () => {
    // 先计算一下总价
    excel.methods.allTotal();
    // 获取所有机器信息
    excel.methods.getAll();

    let timer = setTimeout(() => {
      // 默认选中必选的信息
      excel.methods.selectDefaultMode();

      clearTimeout(timer);
    });
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
      总金额: "all-total",
    },
    // 数据
    dataList: [
      {
        name: "BMS",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
        "all-total": 0,
      },
      {
        name: "EMS",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
        "all-total": 0,
      },
      // 集装箱
      {
        name: "10尺集装箱",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
        "all-total": 0,
      },
      {
        name: "空调系统",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
        "all-total": 0,
      },
      {
        name: "消防系统",
        num: 0,
        price: 0,
        total: 0,
        remarks: "",
        "all-total": 0,
      },

      {
        name: "逆变器",
        num: 10,
        price: 15,
        total: 0,
        remarks: "",
        "all-total": 0,
      },
    ],

    // 合计表
    dataFooter: {
      num: 0,
      price: 0,
      total: 0,
    },

    // 所有机器的信息
    allmachineInfo: <any>[],

    // 集装箱
  },

  methods: {
    // 选择集装箱
    selectJiZhuangXiang: (val: any) => {
      console.log(123, "123", val);
    },

    // 获取所有的机器信号
    getAll: async () => {
      let res: any = await getAllNBQ();
      if (!res) return;
      let datas = res?.data;
      datas.map((data: any) => {
        excel.data.allmachineInfo.push(data);
        console.log(excel.data.allmachineInfo, "excel.allmachineInfo");
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
      console.log(row, "data");

      let total = Number(row.num) * Number(row.price);
      return total;
    },

    // 所有销量合计
    countAllAmount: (data: any) => {
      let count = 0;
      data.forEach((row: any) => {
        count += excel.methods.countAmount(row);
      });
      return count;
    },

    // 更新数量
    updataNumber: () => {
      const $table = xTable?.value;
      console.log(xTable, "xTable");
      if (!$table) return;
      $table.updateFooter();
    },

    // 在值发生改变时更新表尾合计
    updateFooterEvent: () => {
      const $table = xTable?.value;
      if (!$table) return;
      $table.updateFooter();
    },

    // 数量和
    sumNum(list: any, field: string) {
      let count = 0;
      list.forEach((item: any) => {
        count += Number(item[field]);
      });
      return count;
    },

    // 计算总数
    allTotal: () => {
      excel.data.dataList.map((item: any, index: number) => {
        let n = excel.data.dataList[index]["num"];
        let p = excel.data.dataList[index]["price"];
        excel.data.dataList[index]["total"] = n * p;
      });
      excel.data.dataFooter.total = excel.methods.sumNum(
        excel.data.dataList,
        "total"
      );
    },

    // 合计计算
    footerMethod({ columns, data }: any) {
      return [
        columns.map((column: any, columnIndex: any) => {
          let title: string = column?.title;
          switch (title) {
            case "序号":
              return "合计";
              break;
            case "数量":
              // excel.dataFooter.num = excel.sumNum(excel.dataList, "num");
              // return excel.dataFooter.num;
              break;
            case "单价":
              // excel.dataFooter.price = excel.sumNum(excel.dataList, "price");
              // return excel.dataFooter.price;
              break;
            case "总价":
              excel.data.dataFooter.total = excel.methods.sumNum(
                excel.data.dataList,
                "total"
              );
              return excel.data.dataFooter.total;
              break;
            default:
              break;
          }
        }),
      ];
    },

    checkMethod() {
      return true;
    },

    // 切换选中的行列
    checkboxChangeEvent({ checked, records, reserves }: any) {
      const selectName = JSON.stringify(records);
      // console.log(checked ? "勾选事件" : "取消事件");
      // console.log("当前选中的数据：" + selectName);
      // console.log("翻页时其他页的数据：" + reserves);
      console.log(JSON.parse(selectName), "JSON.parse(selectName)");
    },

    // 默认选中出基础的5项以外的数据
    selectDefaultMode() {
      excel.data.dataList.map((i: any, index: number) => {
        if (index >= 5) {
          xTable?.value.toggleCheckboxRow(excel.data.dataList[index]);
        }
      });
    },
  },
});

excel.init();

defineExpose({
  excel,
});
</script>

<template>
  <div class="exc">
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
        checkMethod: excel.methods.checkMethod,
        highlight: true,
      }"
      @checkbox-change="excel.methods.checkboxChangeEvent"
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
            <p>{{ row.name }}</p>
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
            change: () => {
              excel.methods.updataNumber();
              excel.methods.allTotal();
            },
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
            change: () => {
              excel.methods.updateFooterEvent();
              excel.methods.allTotal();
            },
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
