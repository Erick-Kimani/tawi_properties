# Frontend-Backend Integration Guide

This guide explains how to use the API services to connect your Vue.js frontend to the Laravel backend.

## Setup

1. **Environment Configuration**
   - The `.env` file contains `VITE_API_BASE_URL` which defaults to `http://localhost:8000/api`
   - Update this if your backend runs on a different URL

2. **API Services Created**
   - `src/services/api.js` - Main axios instance with interceptors
   - `src/services/authService.js` - Authentication endpoints
   - `src/services/roleService.js` - Role management endpoints

## Usage Examples

### In Vue Components

```vue
<script setup>
import { ref } from 'vue'
import authService from '@/services/authService'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

async function handleLogin() {
  loading.value = true
  error.value = null
  
  try {
    const response = await authService.login({
      email: email.value,
      password: password.value
    })
    
    // Store token
    localStorage.setItem('auth_token', response.data.token)
    
    // Redirect or update state
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
```

### In Pinia Stores

```js
// stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))

  async function login(credentials) {
    try {
      const response = await authService.login(credentials)
      token.value = response.data.token
      localStorage.setItem('auth_token', token.value)
      user.value = response.data.user
      return response.data
    } catch (error) {
      throw error
    }
  }

  async function logout() {
    try {
      await authService.logout()
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
    } catch (error) {
      throw error
    }
  }

  return { user, token, login, logout }
})
```

## Available Services

### Authentication Service

```js
import authService from '@/services/authService'

// Register new user
authService.register({ email, password, name })

// Login
authService.login({ email, password })

// Logout (requires auth)
authService.logout()

// Get current user (requires auth)
authService.getCurrentUser()

// Get user by ID (requires auth & admin)
authService.getUserById(id)

// Delete user (requires auth & admin)
authService.deleteUser(id)
```

### Role Service

```js
import roleService from '@/services/roleService'

// Get all roles (requires auth & admin)
roleService.getAllRoles()

// Get role by ID (requires auth & admin)
roleService.getRoleById(id)

// Create role (requires auth & admin)
roleService.createRole({ name, description })

// Update role (requires auth & admin)
roleService.updateRole(id, { name, description })

// Delete role (requires auth & admin)
roleService.deleteRole(id)
```

## Backend Requirements

Make sure your Laravel backend is running with CORS enabled. Update your `config/cors.php` if needed:

```php
'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
```

## Running Both Frontend & Backend

1. **Backend (Laravel)** - in munchies_backend folder:
   ```bash
   php artisan serve
   ```

2. **Frontend (Vue.js)** - in tawi_properties folder:
   ```bash
   npm run dev
   ```

The frontend will typically run on `http://localhost:5173` and the backend on `http://localhost:8000`.
