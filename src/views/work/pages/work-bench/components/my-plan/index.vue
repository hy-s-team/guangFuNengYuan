<style scoped lang="less">
@import "./../../../../../../assets/less/work/workbench/my-plan/my-plan.less";
</style>
<script setup lang="ts">
import { reactive, ref } from "vue";
import bus from "./../../../../../../utils/eventbus/eventsbus";
import { ElMessageBox } from "element-plus";
//@ts-ignore
import Pop from "./../pop.vue";
//@ts-ignore
import Form from "./../../../add-plan/plan/index.vue";
// @ts-ignore
const drawer = ref(false);
const handleClose = (done: () => void) => {
  console.log(12313, "12313");

  done();
};

// 添加我的方案
const myPlan = reactive({
  data: {},
  methods: {
    init: () => {},
    // 新建方案
    addNewPlan: () => {
      bus.$emit("showPlanMenu", true);
    },
  },
});
myPlan.methods.init();
</script>
<template>
  <div class="my-plan">
    <div class="title">
      <div class="search">
        <el-input placeholder="搜索方案"></el-input>
      </div>
    </div>
    <div class="menu">
      <div class="left">
        <div class="txt">我的方案</div>
        <div class="sel">
          <div>创建事件</div>
          <div>所有状态</div>
        </div>
      </div>
      <div class="right">
        <div class="mode-sel">
          <div class="iconfont icon-xuanzhong"></div>
          <div class="iconfont icon-moxing_xuanzhong"></div>
        </div>
      </div>
    </div>
    <div class="content">
      <div
        @click="
          () => {
            // myPlan.methods.addNewPlan();
            drawer = true;
          }
        "
        class="add-new-plan"
      >
        <p>+</p>
        <p>新建方案</p>
      </div>
      <div class="plan-list" v-for="(i, index) in new Array(50).fill('')">
        {{ `方案:${index}` }}
      </div>
    </div>
    <!-- <Pop></Pop> -->

    <div class="pop">
      <el-drawer
        v-model="drawer"
        title="新建方案"
        direction="rtl"
        :before-close="handleClose"
      >
        <el-form> 12313 </el-form>
        <div class="el-drawer__footer">
          <el-button>取 消</el-button>
          <el-button type="primary">{{ "保存方案" }}</el-button>
        </div>
      </el-drawer>
    </div>
    <Form></Form>
  </div>
</template>
