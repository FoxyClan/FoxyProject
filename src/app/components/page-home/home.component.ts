import { Component, ElementRef, Directive, HostListener, Renderer2, Input } from '@angular/core';
import { DetailsComponent } from '../page-details/details.component';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DetailsComponent,
    RouterOutlet,
    RouterLink,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {
  scrollToTop: boolean = false;
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('window:wheel', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onFakeScroll(event: WheelEvent) {
    const currentScroll = event.deltaY || 0;
    const container = this.el.nativeElement.querySelector('.container');
    const appDetails = this.el.nativeElement.querySelector('app-details');

    if (currentScroll > 0) {
      this.scrollToTop = false;
      this.renderer.addClass(container, 'fly-away');
      this.renderer.addClass(appDetails, 'show-over');
    } else if (currentScroll < 0 && this.scrollToTop) {
      this.renderer.removeClass(container, 'fly-away');
      this.renderer.removeClass(appDetails, 'show-over');
    }
  }

  handleScrollToTop() {
    this.scrollToTop = true;
  }
}

