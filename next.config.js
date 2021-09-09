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
    ROOT_URL: process.env.ROOT_URL
           || (
               isDev ? 'https://localhost'
               : isProd ? 'https://life-manager-app.herokuapp.com'
               : ''
              ),
    LIFF_ID: process.env.LIFF_ID
          || (
               isDev ? ''
               : isProd ? '' // should define in environment process
               : ''
             ),
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY
                   || (
                        isDev ? ''
                        : isProd ? '' // should define in environment process
                        : ''
                      ),
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
      } : {}
  },
}
