import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Homepage.vue'
import SignUpView from '../views/Signup.vue'
import Login from '../views/Login.vue'
import Admin from '../views/Admin.vue'
import Listaproperty from '../views/Listaproperty.vue'
import PropertyMap from '../components/PropertyMap.vue'
import CategoryListing from '../views/Categorylisting.vue'
import BuyPage from '../views/Buypage.vue'
import RentPage from '../views/Rentpage.vue'

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
    },
    {
      path: '/list-property',
      name: 'list-property',
      component: Listaproperty,
    },
    {
      path: '/property-map',
      name: 'property-map',
      component: PropertyMap,
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
    }
  ],
})

// Global auth guard: require authentication for all routes
const publicPages = ['/login', '/signup']

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const isPublic = publicPages.includes(to.path)

  if (!isPublic && !token) {
    // Not authenticated and trying to access a protected page
    return next({ name: 'login' })
  }

  // Proceed to route
  return next()
})

export default router