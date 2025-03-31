import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DetailsComponent } from '../page-details/details.component';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RotateWarningComponent } from '../rotate-warning/rotate-warning.component';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DetailsComponent,
    RouterLink,
    CommonModule,
    RotateWarningComponent
  ],
  animations: [
    trigger('popOut', [
      state('void', style({
        transform: 'scale(1.2)',
        opacity: 0
      })),
      transition('void => *', [
        animate('200ms ease-out',
          style({transform: 'scale(1)', opacity: 1}))
      ])
    ])
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {

  constructor(private el: ElementRef, private renderer: Renderer2, private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.urlAfterRedirects === '/home') {
        this.resetToHomeView();
      }
    });
  }

  resetToHomeView() {
    const container = this.el.nativeElement.querySelector('.container');
    const appDetails = this.el.nativeElement.querySelector('app-details');

    window.scrollTo({ top: 0, behavior: 'auto' });

    this.renderer.removeClass(container, 'fly-away');
    this.renderer.removeClass(appDetails, 'show-over');
    this.renderer.removeClass(appDetails, 'index3');
    this.renderer.addClass(appDetails, 'index1');
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:wheel', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  @HostListener('mousedown', ['$event'])
  onFakeScroll(event: WheelEvent) {
    const rootElement = document.documentElement;
    const currentScroll = event.deltaY || 0;
    const container = this.el.nativeElement.querySelector('.container');
    const appDetails = this.el.nativeElement.querySelector('app-details');

    if (rootElement.scrollTop > 0) {
      this.renderer.addClass(container, 'fly-away');
      this.renderer.addClass(appDetails, 'show-over');
      this.renderer.removeClass(appDetails, 'index1');
      this.renderer.addClass(appDetails, 'index3');

      setTimeout(() => {
        this.renderer.removeClass(container, 'fly-back');
      }, 300);
    } 
    else if (rootElement.scrollTop === 0 && currentScroll < 0) {
      this.renderer.removeClass(appDetails, 'show-over');
      this.renderer.removeClass(container, 'fly-away');
      setTimeout(() => {
        this.renderer.removeClass(appDetails, 'index3');
        this.renderer.addClass(appDetails, 'index1');
      }, 300);
    }
  }

  scrollToDetails() {
    window.scrollBy({ top: window.innerHeight*0.01, behavior: 'smooth' });
  }


}



