import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-rotate-warning',
  templateUrl: './rotate-warning.component.html',
  styleUrls: ['./rotate-warning.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class RotateWarningComponent {
  isLandscape: boolean = false;

  constructor() {
    this.checkOrientation();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkOrientation();
  }

  checkOrientation() {
    if (typeof window == 'undefined') return
    const isLandscapeNow = window.innerWidth <= 1000 && window.innerWidth > window.innerHeight;
    this.isLandscape = isLandscapeNow;
  }
}
