<style scoped lang="less">
@import "../../../../../../assets/less/compute/compute.less";
</style>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { powerDemand } from "./../../../../../../assets/api/compute/compute";
/*
    电能计算 总对象
*/
const compute = reactive({
  value: {},
  methods: {},
  coms: {
    // 电量 kwh
    energy: {
      value: 0,
      methods: {},
    },
    // 逆变器
    machineModel: {
      model: "",
      data: [
        {
          value: "逆变器组1",
          label: "逆变器组1",
        },
        {
          value: "逆变器组1-1",
          label: "逆变器组1-1",
        },
        {
          value: "逆变器组1-2",
          label: "逆变器组1-2",
        },
      ],
      methods: {
        select: (id: string) => {
          compute.coms.machineModel.model = id;
        },
      },
    },
    // 提交
    sub: {
      methods: {
        // 提交发电需求以及信号信息
        subInfo: async () => {
          let res = await powerDemand({
            electricQuantity: compute.coms.energy.value,
            transformerType: compute.coms.machineModel.model,
          });
          console.log(res, "res");
        },
      },
    },
  },
});
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

        <!-- 变电器信号 -->
        <div class="type">
          <p>逆变器型号:</p>
          <el-tree-select
            placeholder="变电器101"
            v-model="compute.coms.machineModel.model"
            :data="compute.coms.machineModel.data"
            check-strictly
            @change="
              (id) => {
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
      </div>

      <div class="form">{{ "表格" }}</div>
    </div>
    <div class="footer"></div>
  </div>
</template>
