import joi from 'joi';

export default {
  register: {
    body: {
      email: joi.string().email().required(),
      password: joi.string().min(6).max(30).required(),
      firstName: joi.string().min(3).max(100).required(),
      lastName: joi.string().min(3).max(100).required(),
    },
  },
  login: {
    body: {
      email: joi.string().email().required(),
      password: joi.string().required(),
    },
  },
  updateMe: {
    body: {
      firstName: joi.string().min(3).max(100).required(),
      lastName: joi.string().min(3).max(100).required(),
    },
  },
  createUser: {
    body: {
      loginID: joi.string().required(),
      password: joi.string().min(8).max(128).required(),
      userRole: joi.string().valid('admin', 'user', 'student').optional(),
      status: joi.string().valid('active', 'inactive').optional().default('active')
    }
  },
  updateUser: {
    body: {
      loginID: joi.string().optional(),
      password: joi.string().min(8).max(128).optional(),
      userRole: joi.string().valid('admin', 'user', 'student').optional(),
      status: joi.string().valid('active', 'inactive').optional()
    }
  }
};
