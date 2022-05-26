import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "index",
    component: () => import("../views/index.vue"),
    redirect: "/work/work-bench",
    children: [
      {
        path: "/work",
        name: "work",
        component: () => import("./../views/work/index.vue"),
        children: [
          {
            path: "work-bench",
            name: "work-bench",
            component: () => import("../views/work/pages/work-bench/index.vue"),
          },

          {
            path: "recovery",
            name: "recovery",
            component: () => import("../views/work/pages/recovery/index.vue"),
          },
          {
            path: "product-lib",
            name: "product-lib",
            component: () =>
              import("../views/work/pages/product-lib/index.vue"),
          },
          {
            path: "collect",
            name: "collect",
            component: () => import("../views/work/pages/collect/index.vue"),
          },
        ],
      },
      {
        path: "/login",
        name: "login",
        component: () => import("../views/login/index.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
