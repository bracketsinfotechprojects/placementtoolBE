const basePath = '/api';

export default {
  url: {
    basePath,
  },
  timers: {
    userCookieExpiry: '720h',
  },
  env: {
    authSecret: process.env.TOKEN_SECRET_KEY || 'test',
  },
  authorizationIgnorePath: [
    '/api',
    '/api/auth/login',
    '/api/auth/register',
  ],
};
