import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import authenticate from '../middlewares/authenticate.middleware';
import constants from '../constants';
import indexRoute from '../routes/index.route';
import joiErrorHandler from '../middlewares/joi-error-handler.middleware';
import { notFoundErrorHandler, errorHandler } from '../middlewares/api-error-handler.middleware';
import swaggerSpec from './swagger.config';
import responseTimeMiddleware from '../middlewares/response-time.middleware';

const app = express();

app.use((req, res, next) => {
  const origin = req.get('origin');

  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,HEAD,OPTIONS,PUT,PATCH,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Access-Control-Request-Method, Access-Control-Allow-Headers, Access-Control-Request-Headers');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

const corsOption = {
  origin: process.env.FRONTEND_BASE_URL ? [process.env.FRONTEND_BASE_URL] : true,
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}

app.use(cors(corsOption));

app.use(express.json() as any);

app.use(morgan('dev') as any);

// Response time tracking middleware
app.use(responseTimeMiddleware);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true
  },
  customCss: '.swagger-ui .topbar { display: none }'
}));

// app.use(authenticate as any); // Temporarily disabled for testing

// Router
app.use(constants.APPLICATION.url.basePath, indexRoute);

// Enable student routes for testing
import studentRoute from '../routes/student/student.route';
app.use('/student', studentRoute);

// Joi Error Handler
app.use(joiErrorHandler);

// Error Handler
app.use(notFoundErrorHandler);
app.use(errorHandler);

export default app;
