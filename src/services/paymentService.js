import apiClient from './api'

export const paymentService = {
  // Requires auth (apiClient's interceptor attaches the Bearer token
  // automatically). phone is whatever the user typed — normalization
  // to Daraja's MSISDN format happens server-side, so this can be
  // '0712345678', '+254712345678', etc.
  //
  // Resolves to { message, checkout_request_id, amount }.
  initiateListingFeePayment(phone) {
    return apiClient.post('/payments/mpesa/stkpush', { phone })
  },

  // Polled while the customer completes the STK prompt on their phone.
  // Resolves to { status: 'pending' | 'completed' | 'failed' | 'cancelled',
  // result_desc, mpesa_receipt_number }.
  getPaymentStatus(checkoutRequestId) {
    return apiClient.get(`/payments/mpesa/${checkoutRequestId}/status`)
  }
}

export default paymentService