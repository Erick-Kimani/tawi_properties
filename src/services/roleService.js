import apiClient from './api'

export const roleService = {
  getAllRoles() {
    return apiClient.get('/getAllRoles')
  },

  getRoleById(id) {
    return apiClient.get(`/getRole/${id}`)
  },

  createRole(roleData) {
    return apiClient.post('/createRole', roleData)
  },

  updateRole(id, roleData) {
    return apiClient.put(`/updateRole/${id}`, roleData)
  },

  deleteRole(id) {
    return apiClient.delete(`/deleteRole/${id}`)
  }
}

export default roleService
