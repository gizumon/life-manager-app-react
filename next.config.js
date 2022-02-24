const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

console.log(`Run on ${isDev ? 'DEV' : isProd ? 'PROD' : 'UNKNOWN'} environment...`);

/**
 * Need to set prod key environments
 *  - LIFF_ID
 *  - FIREBASE_API_KEY
 */
module.exports = {
  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
    ROOT_URL: process.env.ROOT_URL,
    LIFF_ID: process.env.LIFF_ID,
    LINE_AUTH_ENDPOINT: process.env.LINE_AUTH_ENDPOINT,
    LINE_AUTH_CLIENT_ID: process.env.LINE_AUTH_CLIENT_ID,
    CHANNEL_ACCESS_TOKEN: process.env.CHANNEL_ACCESS_TOKEN,
    CHANNEL_SECRET: process.env.CHANNEL_SECRET,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE: isDev ? {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: "life-manager-app-303611.firebaseapp.com",
        databaseURL: "https://life-manager-app-303611-default-rtdb.firebaseio.com",
        projectId: "life-manager-app-303611",
        storageBucket: "life-manager-app-303611.appspot.com",
        messagingSenderId: "228392641348",
        appId: "1:228392641348:web:9291e5a9d7554f7e296d11",
        measurementId: "G-KC6X7VM4SE"
      } : isProd ? {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: "life-manager-app-303611.firebaseapp.com",
        databaseURL: "https://life-manager-app-303611-default-rtdb.firebaseio.com",
        projectId: "life-manager-app-303611",
        storageBucket: "life-manager-app-303611.appspot.com",
        messagingSenderId: "228392641348",
        appId: "1:228392641348:web:9291e5a9d7554f7e296d11",
        measurementId: "G-KC6X7VM4SE"
      } : {},
    FIREBASE_ADMIN: {
      type: "service_account",
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_x509_CERT_URL,
    },
    FIREBASE_DB_URL: process.env.FIREBASE_DB_URL,
    GA_ID: process.env.GA_ID,
  },
};
