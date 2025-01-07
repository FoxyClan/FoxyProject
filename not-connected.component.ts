import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-connected',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-connected.component.html',
  styleUrl: './not-connected.component.css'
})
export class NotConnectedComponent {
  connectWallet() {
    // Implement wallet connection logic or emit an event to parent
    console.log('Connecting wallet...');
  }
}
