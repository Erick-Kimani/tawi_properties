import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Homepage.vue'
import SignUpView from '../views/Signup.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    }
  ],
})

export default router