/**
 * Setup express server.
 */

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import express, { NextFunction, Request, Response } from 'express';

import helmet from 'helmet';
import logger from 'jet-logger';
import morgan from 'morgan';
import path from 'path';

import 'express-async-errors';

import EnvVars from '../constants/env_vars';
import HttpStatusCodes from '../constants/http_status_codes';

import { NODE_ENVS } from '../constants/misc';

import routes from './routes';
import { RouteError } from './types/types';

// **** Variables **** //

const app = express();

// **** AllowOrigin **** //

// 配置 cors 中间件
app.use(
  cors({
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
    // 允许跨域请求的url
    origin: ['http://localhost:3000', 'https://mirai_lc.vercel.app'],
  })
);

// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(EnvVars.Cookie.Secret));
app.use(bodyParser.json());

// Show routes called in console during development
if (EnvVars.NodeEnv === NODE_ENVS.DEV.valueOf()) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NODE_ENVS.PROD.valueOf()) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use('/api', routes);

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  logger.err(err, true);
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
  }
  return res.status(status).json({ message: err.message });
});

// ** Front-End Content ** //

// Set static directory
const staticDir = path.join(__dirname, '../public');
app.use(express.static(staticDir));

// **** Export default **** //

export default app;
