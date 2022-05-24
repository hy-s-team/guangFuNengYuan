import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/less/p.less";
import ElementPlus from "element-plus";
import "xe-utils";
import VXETable from "vxe-table";
import "element-plus/theme-chalk/index.css";
import "../node_modules/vxe-table/lib/style.css";
createApp(App)
  .use(store)
  .use(router)
  .use(ElementPlus)
  .use(VXETable)
  .mount("#app");
