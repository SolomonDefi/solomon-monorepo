import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import SelectMethod from './views/SelectMethod.vue'
import ExternalLink from './views/ExternalLink.vue'
import SolomonLink from './views/SolomonLink.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise((resolve, _reject) => {
        setTimeout(() => {
          resolve({ el: to.hash })
        }, 500)
      })
    }
    if (savedPosition) {
      return savedPosition
    }
    if (to.meta.noScroll && from.meta.noScroll) {
      return {}
    }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'Solomon Evidence' },
    },
    {
      path: '/select/:type(buyer|merchant)',
      name: 'select',
      component: SelectMethod,
      meta: { title: 'Evidence Method' },
    },
    {
      path: '/upload-external/:type(buyer|merchant)',
      name: 'upload-external',
      component: ExternalLink,
      meta: { title: 'External Link' },
    },
    {
      path: '/upload-solomon/:type(buyer|merchant)',
      name: 'upload-solomon',
      component: SolomonLink,
      meta: { title: 'Solomon Link' },
    },
  ],
})

router.afterEach((to, _from) => {
  const parent = to.matched.find((record) => record.meta.title)
  const parentTitle = parent ? parent.meta.title : null
  document.title = to.meta.title || parentTitle || 'Solomon Evidence'
})

export default router
