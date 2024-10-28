import { Component, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-details',
  standalone: true,
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {
  @Output() scrollToTop = new EventEmitter();

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:wheel', ['$event'])
  @HostListener('window:touchmove', ['$event'])
onWindowScroll() {
  const rootElement = document.documentElement;
  if (rootElement.scrollTop === 0) {
    this.scrollToTop.emit();
  }
}

  
}

