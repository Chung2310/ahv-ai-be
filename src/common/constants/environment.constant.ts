import config from '../config/config';

const ENVIRONMENT = {
    AHV_API_URL: config.ahvAi.apiBase,
    X_API_KEY: config.ahvAi.apiKey,
    TIME_OUT: 1000000,
};

export default ENVIRONMENT;
