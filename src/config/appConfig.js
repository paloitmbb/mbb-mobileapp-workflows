import { ENVIRONMENTS } from '../constants/appConstants';

/**
 * App configuration based on build environment
 */
const configs = {
  [ENVIRONMENTS.SIT]: {
    environment: ENVIRONMENTS.SIT,
    debugMode: true,
    logLevel: 'debug',
  },
  [ENVIRONMENTS.STAGING]: {
    environment: ENVIRONMENTS.STAGING,
    debugMode: true,
    logLevel: 'info',
  },
  [ENVIRONMENTS.PRODUCTION]: {
    environment: ENVIRONMENTS.PRODUCTION,
    debugMode: false,
    logLevel: 'error',
  },
};

export const getConfig = () => {
  const env = process.env.APP_ENV || ENVIRONMENTS.SIT;
  return configs[env] || configs[ENVIRONMENTS.SIT];
};
