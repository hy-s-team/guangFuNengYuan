import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "index",
    component: () => import("../views/index.vue"),
    children: [
      {
        path: "/compute",
        name: "compute",
        component: () => import("../views/index/views/compute/index.vue"),
        children: [
          {
            path: "compute-1",
            name: "compute-1",
            component: () =>
              import("../views/index/views/compute/pages/compute-1/index.vue"),
          },
        ],
      },
      {
        path: "/login",
        name: "login",
        component: () => import("../views/index/views/login/index.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
