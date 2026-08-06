import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Homepage.vue'
import SignUpView from '../views/Signup.vue'
import Login from '../views/Login.vue'
import Admin from '../views/Admin.vue'
import Listaproperty from '../views/Listaproperty.vue'
import PropertyMap from '../components/PropertyMap.vue'
import CategoryListing from '../views/Categorylisting.vue'
//import Propertycategories from '../viewsPropertycategories.vue'

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
      path: '/category/:slug',
      name: 'category',
      component: CategoryListing,
      props: true,
    },
    {
      path: '/property-categories',
      name: 'property-categories',
      component: Propertycategories,
    }
  ],
})

export default router