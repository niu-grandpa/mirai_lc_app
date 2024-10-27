import logger from 'jet-logger';
import './pre-start'; // Must be the first import

import EnvVars from '../constants/env_vars';
import server from './server';

import '../database';
import './schedule';

// **** Run **** //

const SERVER_START_MSG =
  'Express server started on port: ' + EnvVars.Port.toString();

server.listen(EnvVars.Port, () => logger.info(SERVER_START_MSG));
