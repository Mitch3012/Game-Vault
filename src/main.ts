import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { applyAppCheckDebugToken } from './app/app-check-debug';
import { environment } from './environments/environment';

// Must run before bootstrap: AngularFire reads the debug token when App Check is created.
applyAppCheckDebugToken(environment.appCheckDebugToken);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
