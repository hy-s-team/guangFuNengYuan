<style scoped lang="less">
@import "./../../assets/less/work/work.less";
</style>

<script setup lang="ts">
// @ts-ignore
import Plan from "./pages/add-plan/plan/index.vue";
// import Plan from "./pages/work-bench/components/my-plan/index.vue";
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import bus from "./../../utils/eventbus/eventsbus";
/* 路由*/
const router = useRouter();
const route = useRoute();
/* 事件注册 --- add-plan */
bus.$on("add-plan", () => {
  work.data.showPlan = true;
});
/* 退出新建方案 --- back-from-add-plan */
bus.$on("back-from-add-plan", () => {
  work.data.showPlan = false;
});

// 工作方案台
const work = reactive({
  methods: {
    // 初始化
    init: () => {},
    // 切换组件
    changeComs: (info: any, name: string) => {
      const { routerName } = info;
      const baseUrl = work.methods.getBaseUrl();
      router.push({ path: `${baseUrl}/${routerName}` });
    },
    //指定字符串中最后一位的位置
    selectLastStringIndex(str: string, zf: any) {
      return str.lastIndexOf(zf);
    },
    // 获取当前路由
    getBaseUrl() {
      const { fullPath } = route;
      const baseUrl = fullPath.slice(
        0,
        work.methods.selectLastStringIndex(fullPath, "/")
      );

      return baseUrl;
    },
  },
  data: {
    menu: {
      workbench: {
        icon: "icon-zu",
        name: "工作台",
        routerName: "work-bench",
      },
      collect: {
        icon: "icon-caizhi_zhengchang",
        name: "收藏",
        routerName: "collect",
      },
      recovery: {
        icon: "icon-shanchu",
        name: "回收站",
        routerName: "recovery",
      },
      productlib: {
        icon: "icon-moxing_zhengchang",
        name: "产品库",
        routerName: "product-lib",
      },
    },
    selectMenu: "工作台",
    showPlan: false,
  },
});
</script>

<template>
  <div class="work">
    <div class="work-content">
      <div class="menu">
        <div class="tab-up">
          <div class="avatar"></div>
          <div class="tab-menu">
            <div v-for="(info, name) in work.data.menu">
              <div
                :class="
                  work.data.selectMenu === info.name ? 'selected-menu' : ''
                "
                @click="
                  () => {
                    work.data.selectMenu = info.name;
                    work.methods.changeComs(info, name);
                  }
                "
              >
                <i :class="`iconfont ${info.icon}`"></i>
                <p>{{ info.name }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="tab-lower">
          <div class="set-up">
            <i class="iconfont icon-caidan"></i>
            <p>设置</p>
          </div>
        </div>
      </div>
      <div class="coms">
        <router-view />
      </div>
    </div>
    <!-- <div class="plan" v-show="work.data.showPlan"> -->
    <div class="plan" v-show="true">
      <Plan></Plan>
    </div>
  </div>
</template>
