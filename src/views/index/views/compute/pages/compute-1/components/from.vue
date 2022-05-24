<style lang="less" scoped></style>
<script setup lang="ts">
import { reactive, ref, defineProps } from "vue";
import { getAllNBQ } from "./../../../../../../../assets/api/compute/compute";
const excel = reactive({
  xTable: ref(),
  init: () => {
    // 先计算一下总价
    excel.allTotal();

    excel.getAll();
  },
  // 标题
  titleName: {
    序号: "seq",
    名称: "name",
    类型: "type",
    规格: "specs",
    数量: "num",
    价格: "price",
    总价合计: "total",
  },
  // 数据
  dataList: [
    {
      type: "变电器750Kwh",
      name: "GSE0050-PV",
      specs: "规格zxc",
      num: 10,
      price: 10,
      total: 0,
    },
    {
      type: "逆变器fs-vgx",
      name: "GSE0050-PV",
      specs: "规格cvb",
      num: 10,
      price: 500,
      total: 0,
    },
    {
      type: "0.5C规格架子",
      name: "GSE0050-PV",
      specs: "规格bnm",
      num: 10,
      price: 10,
      total: 0,
    },
  ],
  // 合计表
  dataFooter: {
    num: 0,
    price: 0,
    total: 0,
  },

  allmachineInfo: <any>[],

  // 获取所有的机器信号
  getAll: async () => {
    let res: any = await getAllNBQ();
    if (!res) return;
    let datas = res?.data;
    datas.map((data: any) => {
      excel.allmachineInfo.push(data);
      console.log(excel.allmachineInfo, "excel.allmachineInfo");
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

  // 所有销量合计
  countAllAmount: (data: any) => {
    let count = 0;
    data.forEach((row: any) => {
      count += excel.countAmount(row);
    });
    return count;
  },

  // 更新数量
  updataNumber: () => {
    const $table = excel.xTable?.value;
    if (!$table) return;
    $table.updateFooter();
  },

  // 在值发生改变时更新表尾合计
  updateFooterEvent: () => {
    const $table = excel.xTable?.value;
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
    excel.dataList.map((item: any, index: number) => {
      let n = excel.dataList[index]["num"];
      let p = excel.dataList[index]["price"];
      excel.dataList[index]["total"] = n * p;
    });
    excel.dataFooter.total = excel.sumNum(excel.dataList, "total");
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
            excel.dataFooter.num = excel.sumNum(excel.dataList, "num");
            return excel.dataFooter.num;
            break;
          case "价格":
            excel.dataFooter.price = excel.sumNum(excel.dataList, "price");
            return excel.dataFooter.price;
            break;
          case "总计":
            excel.dataFooter.total = excel.sumNum(excel.dataList, "total");
            return excel.dataFooter.total;
            break;
          default:
            break;
        }
      }),
    ];
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
      show-header-overflow
      show-overflow
      show-footer
      class="mytable-style"
      ref="xTable"
      highlight-hover-row
      :footer-method="excel.footerMethod"
      :footer-cell-class-name="excel.footerCellClassName"
      :edit-config="{ trigger: 'click', mode: 'row' }"
      :data="excel.dataList"
    >
      <vxe-table-column type="seq" title="序号" width="60"></vxe-table-column>
      <vxe-table-column
        field="name"
        title="名称"
        min-width="100"
      ></vxe-table-column>
      <vxe-table-column
        field="type"
        title="类型"
        min-width="100"
      ></vxe-table-column>
      <vxe-table-column
        field="specs"
        title="规格"
        min-width="100"
      ></vxe-table-column>
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
              excel.updataNumber();
              excel.allTotal();
            },
          },
        }"
      ></vxe-table-column>
      <vxe-table-column
        field="price"
        title="价格"
        :edit-render="{
          name: '$input',
          immediate: true,
          props: { type: 'number' },
          events: {
            change: () => {
              excel.updateFooterEvent();
              excel.allTotal();
            },
          },
        }"
        width="150"
      ></vxe-table-column>

      <vxe-table-column field="total" title="总计" width="140">
        <template #default="{ row }">
          <span>{{ excel.countAmount(row) }}</span>
        </template>
      </vxe-table-column>
    </vxe-table>
  </div>
</template>
