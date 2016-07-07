module.exports = {
  concierge: {
    targetNumber: process.env.MY_PHONE_NUMBER,
    twilioNumber: process.env.TWILIO_CONCIERGE_NUMBER
  },
  messageServiceId: process.env.TWILIO_MESSAGE_SERVICE_ID,
  senderId: process.env.TWILIO_SENDER_ID,
  password: process.env.AUTH_USERNAME || 'pw',
  username: process.env.AUTH_PASSWORD || 'batman'
};