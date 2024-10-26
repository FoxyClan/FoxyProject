import { Routes } from '@angular/router';
import { HomeComponent } from '../components/page-home/home.component';
import { CollectionComponent } from '../components/page-collection/collection.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: 'ErrorPage', pathMatch: 'full'},
  { path: 'ErrorPage', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'collection', component: CollectionComponent }
];
