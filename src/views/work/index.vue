<style scoped lang="less">
@import "./../../assets/less/work/work.less";
</style>

<script setup lang="ts">
// @ts-ignore
import Plan from "./pages/work-bench/index.vue";
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
// 路由
const router = useRouter();
const route = useRoute();
console.log(route, "route");
// 工作方案台
const work = reactive({
  methods: {
    changeComs: (info: any, name: string) => {
      const { routerName } = info;
      const baseUrl = work.methods.getBaseUrl();
      router.push({ path: `${baseUrl}/${routerName}` });
    },

    //指定字符串中最后一位的位置
    selectLastStringIndex(str: string, zf: any) {
      return str.lastIndexOf(zf);
    },

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
  },
});
</script>

<template>
  <div class="work">
    <div class="title"></div>
    <div class="content">
      <div class="menu">
        <div class="tab-up">
          <div
            v-for="(info, name) in work.data.menu"
            :class="work.data.selectMenu === info.name ? 'selected-menu' : ''"
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
        <div class="tab-down"></div>
      </div>
      <div class="coms">
        <router-view />
      </div>
    </div>
  </div>
</template>
