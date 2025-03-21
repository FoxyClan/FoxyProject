import { Routes } from '@angular/router';
import { HomeComponent } from '../components/page-home/home.component';
import { CollectionComponent } from '../components/page-collection/collection.component';
import { ErrorComponent } from '../components/page-error/error.component';
import { MintComponent } from '../components/page-mint/mint.component';
import { RoadmapComponent } from '../components/page-roadmap/roadmap.component';
import { PageUserCollectionComponent } from '../components/page-user-collection/page-user-collection.component';
import { ContactComponent } from '../components/page-contact/contact.component';
import { TeamComponent } from '../components/page-team/team.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'mint', component: MintComponent },
  { path: 'collection', component: CollectionComponent, pathMatch: 'prefix' },
  { path: 'profil', component: PageUserCollectionComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'team', component: TeamComponent },
  { path: 'roadmap', component: RoadmapComponent },
  { path: 'ErrorPage', component: ErrorComponent },
  { path: '**', redirectTo: 'ErrorPage', pathMatch: 'full'}
];
