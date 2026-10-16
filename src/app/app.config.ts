import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
// 1. Import 'getApp' from '@angular/fire/app'
import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { initializeAppCheck, provideAppCheck, ReCaptchaV3Provider } from '@angular/fire/app-check';

import { routes } from './app.routes';
import { FirebaseStatusService } from './firebase-status-service';
import { environment } from '../environments/environment';
import { Auth, provideAuth, getAuth } from '@angular/fire/auth';
import { getAI, provideAI } from '@angular/fire/ai';
import { buildAiOptions } from './ai/ai-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment)),
    provideAppCheck(() => {
      // 2. (Optional) Enable debug token for local testing on localhost
      if (typeof window !== 'undefined' && location.hostname === 'localhost') {
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }

      // 3. Use getApp() here instead of undefined
      return initializeAppCheck(getApp(), {
        provider: new ReCaptchaV3Provider(environment.recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAI(() => getAI(getApp(), buildAiOptions())),
    provideAppInitializer(() => {
      inject(FirebaseStatusService).logConnection();
    }),
  ],
};
