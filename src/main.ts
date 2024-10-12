import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';  // N'oubliez pas d'importer withFetch
import { AppComponent } from './app/app-component/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()), provideAnimationsAsync()
  ]
}).catch(err => console.error(err));
