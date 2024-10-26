import { Routes } from '@angular/router';
import { HomeComponent } from '../components/page-home/home.component';
import { CollectionComponent } from '../components/page-collection/collection.component';
import { ErrorComponent } from '../components/page-error/error.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'collection', component: CollectionComponent },
  { path: 'ErrorPage', component: ErrorComponent },
  { path: '**', redirectTo: 'ErrorPage', pathMatch: 'full'}
];
