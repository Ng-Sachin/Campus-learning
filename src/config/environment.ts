/**
 * Environment Configuration
 * Centralized configuration management for different environments
 */

export const ENV = {
  // Environment type
  isProduction: process.env.REACT_APP_ENV === 'production',
  isDevelopment: process.env.REACT_APP_ENV === 'development',
  
  // Firebase Configuration
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || '',
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || '',
  },
  
  // Google API Configuration
  google: {
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
  },
  
  // Discord Webhooks
  discord: {
    general: process.env.REACT_APP_DISCORD_WEBHOOK_URL || '',
    webhooks: {
      dharamshala: process.env.REACT_APP_DISCORD_WEBHOOK_DHARAMSHALA || '',
      dantewada: process.env.REACT_APP_DISCORD_WEBHOOK_DANTEWADA || '',
      jashpur: process.env.REACT_APP_DISCORD_WEBHOOK_JASHPUR || '',
      raigarh: process.env.REACT_APP_DISCORD_WEBHOOK_RAIGARH || '',
      pune: process.env.REACT_APP_DISCORD_WEBHOOK_PUNE || '',
      sarjapur: process.env.REACT_APP_DISCORD_WEBHOOK_SARJAPUR || '',
      kishanganj: process.env.REACT_APP_DISCORD_WEBHOOK_KISHANGANJ || '',
      eternal: process.env.REACT_APP_DISCORD_WEBHOOK_ETERNAL || '',
    },
  },
  
  // Logging configuration
  logging: {
    enabled: process.env.REACT_APP_ENV !== 'production',
    level: process.env.REACT_APP_ENV === 'production' ? 'error' : 'debug',
  },
};

/**
 * Validate required environment variables
 */
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check Firebase config
  if (!ENV.firebase.apiKey) errors.push('REACT_APP_FIREBASE_API_KEY is missing');
  if (!ENV.firebase.authDomain) errors.push('REACT_APP_FIREBASE_AUTH_DOMAIN is missing');
  if (!ENV.firebase.projectId) errors.push('REACT_APP_FIREBASE_PROJECT_ID is missing');
  
  // Check Google config
  if (!ENV.google.apiKey) errors.push('REACT_APP_GOOGLE_API_KEY is missing');
  if (!ENV.google.clientId) errors.push('REACT_APP_GOOGLE_CLIENT_ID is missing');
  
  return {
    valid: errors.length === 0,
    errors,
  };
};
