import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Added this import
import propertySubmissionService from '@/services/propertySubmissionService'
import HomeView from '../views/Homepage.vue'
import SignUpView from '../views/Signup.vue'
import Login from '../views/Login.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import SetPassword from '../views/Setpassword.vue'
import Admin from '../views/Admin.vue'
import Listaproperty from '../views/Listaproperty.vue'
import MyListings from '../views/MyListings.vue'
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
      path: '/set-password',
      name: 'set-password',
      component: SetPassword,
      meta: { requiresAuth: true },
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
      path: '/my-listings',
      name: 'my-listings',
      component: MyListings,
      meta: { requiresAuth: true, requiresPropertyRegistration: true },
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Everything is public by default — Home, Buy, Rent, the map, category
  // pages, List a Property, and Contact are all browsable without an
  // account. List a Property and Contact each handle their own inline
  // "log in first" treatment for the actual gated action (see
  // Listaproperty.vue / Contact.vue). Admin and My Listings are gated
  // at the router level.
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }
    if (authStore.user?.role?.slug !== 'administrator') {
      return next({ name: 'home' })
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresPropertyRegistration) {
    try {
      const { data } = await propertySubmissionService.getMine()
      if (!Array.isArray(data) || data.length === 0) {
        return next({ name: 'list-property' })
      }
    } catch (error) {
      if (error.response?.status === 401) {
        return next({ name: 'login', query: { redirect: to.fullPath } })
      }
      // Let MyListings show its existing load error instead of treating
      // an unavailable API as proof that the user has no submissions.
    }
  }

  // Set password is a one-time page (see AuthController::setPassword).
  // Once the backend has recorded a password for this account and no
  // admin override is active, send the user to forgot-password instead —
  // that's the supported way to change a password after the first time.
  if (to.name === 'set-password' && authStore.user && authStore.user.can_set_password === false) {
    return next({ name: 'forgot-password' })
  }

  return next()
})

export default router