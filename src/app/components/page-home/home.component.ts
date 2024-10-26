import { Component } from '@angular/core';
import { DetailsComponent } from '../page-details/details.component'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DetailsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
