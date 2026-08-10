import apiClient from './api'

export const propertyTypeService = {
  // Public — active property types only, for dropdowns
  getActivePropertyTypes() {
    return apiClient.get('/getActivePropertyTypes')
  },

  // Admin — all property types, including inactive
  getAllPropertyTypes() {
    return apiClient.get('/getAllPropertyTypes')
  },

  getPropertyTypeById(id) {
    return apiClient.get(`/getPropertyType/${id}`)
  },

  createPropertyType(propertyTypeData) {
    return apiClient.post('/createPropertyType', propertyTypeData)
  },

  updatePropertyType(id, propertyTypeData) {
    return apiClient.put(`/updatePropertyType/${id}`, propertyTypeData)
  },

  deletePropertyType(id) {
    return apiClient.delete(`/deletePropertyType/${id}`)
  }
}

export default propertyTypeService