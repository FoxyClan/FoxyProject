import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app-component/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app-component/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    //provideHttpClient(withFetch()),  // Pour le client HTTP
    provideHttpClient(withInterceptors([])),
    provideAnimationsAsync(),        // Pour les animations
    provideRouter(appRoutes)         // Fournit les routes
  ]
}).catch(err => console.error(err));
