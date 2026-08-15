import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Added this import
import HomeView from '../views/Homepage.vue'
import SignUpView from '../views/Signup.vue'
import Login from '../views/Login.vue'
import Admin from '../views/Admin.vue'
import Listaproperty from '../views/Listaproperty.vue'
import PropertyMapPage from '../views/PropertyMapPage.vue'
import CategoryListing from '../views/Categorylisting.vue'
import BuyPage from '../views/Buypage.vue'
import RentPage from '../views/Rentpage.vue'
import Contact from '../views/Contact.vue'

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
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: { requiresAdmin: true }, // Added this meta tag
    },
    {
      path: '/list-property',
      name: 'list-property',
      component: Listaproperty,
    },
    {
      // PropertyMapPage.vue decides picker vs. browse mode itself, based
      // on whether ?returnTo is present — see that file for details.
      path: '/property-map',
      name: 'property-map',
      component: PropertyMapPage,
    },
    {
      path: '/buy',
      name: 'buy',
      component: BuyPage,
    },
    {
      path: '/rent',
      name: 'rent',
      component: RentPage,
    },
    {
      path: '/category/:slug',
      name: 'category',
      component: CategoryListing,
      props: true,
    },
    {
      path:'/contact',
      name: 'contact',
      component: Contact,
    }
  ],
})

const publicPages = ['/login', '/signup']

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore() // Access the store inside the guard
  const token = localStorage.getItem('auth_token')
  const isPublic = publicPages.includes(to.path)

  if (!isPublic && !token) {
    return next({ name: 'login' })
  }

  // Intercept normal users using the correct nested role slug object structure
  if (to.meta.requiresAdmin && authStore.user?.role?.slug !== 'administrator') {
    return next({ name: 'home' })
  }

  return next()
})

export default router