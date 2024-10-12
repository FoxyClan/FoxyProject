import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from '../components/page-home/home.component';
import { CollectionComponent } from '../components/page-collection/collection.component';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HomeComponent,
    HeaderComponent,
    CollectionComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FoxyClan';
}
