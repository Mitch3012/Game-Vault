// Copy this file to `environment.ts` AND `environment.development.ts` (both are gitignored),
// then replace every placeholder with your own value. See README.md, "Configure".
export const environment = {
  // Firebase web app settings: Firebase console, Project settings, Your apps.
  apiKey: '<firebase web api key>',
  authDomain: '<project>.firebaseapp.com',
  projectId: '<project id>',
  storageBucket: '<project>.firebasestorage.app',
  messagingSenderId: '<sender id>',
  appId: '<app id>',
  measurementId: '<measurement id>',

  // Free key from https://rawg.io/apidocs. Keep it out of public source control.
  rawgApiKey: '<rawg api key>',

  // reCAPTCHA v3 site key registered for App Check.
  recaptchaSiteKey: '<reCAPTCHA Enterprise site key for App Check>',

  // Only for local development: a debug token registered under App Check, Manage debug tokens.
  appCheckDebugToken: '',
};
