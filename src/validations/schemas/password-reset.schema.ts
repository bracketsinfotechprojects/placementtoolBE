import joi from 'joi';

export default {
  requestPasswordReset: {
    body: {
      loginID: joi.string().required()
    }
  },
  verifyOTP: {
    body: {
      loginID: joi.string().required(),
      otp: joi.string().length(6).regex(/^[0-9]+$/).required()
    }
  },
  resetPassword: {
    body: {
      loginID: joi.string().required(),
      otp: joi.string().length(6).regex(/^[0-9]+$/).required(),
      newPassword: joi.string().min(8).max(128).required()
    }
  }
};
