import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Added this import
import HomeView from '../views/Homepage.vue'
import SignUpView from '../views/Signup.vue'
import Login from '../views/Login.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
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
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword,
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Everything is public by default — Home, Buy, Rent, the map, category
  // pages, List a Property, and Contact are all browsable without an
  // account. List a Property and Contact each handle their own inline
  // "log in first" treatment for the actual gated action (see
  // Listaproperty.vue / Contact.vue) rather than being redirected away
  // from here — only /admin is actually gated at the router level.
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }
    if (authStore.user?.role?.slug !== 'administrator') {
      return next({ name: 'home' })
    }
  }

  return next()
})

export default router