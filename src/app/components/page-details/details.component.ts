import { Component, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { ProbabilityModalComponent } from "../probability-modal/probability-modal.component";

@Component({
  selector: 'app-details',
  standalone: true,
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  imports: [ProbabilityModalComponent]
})
export class DetailsComponent {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:wheel', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  @HostListener('mousedown', ['$event'])
  onWindowScroll(event: WheelEvent) {
    const rootElement = document.documentElement;
    const block11 = this.el.nativeElement.querySelector('.block1-1');
    const currentScroll = event.deltaY || 0;
    if (rootElement.scrollTop > 0) {
      this.renderer.addClass(block11, 'fly-away');
    }
    else if (rootElement.scrollTop === 0 && currentScroll < 0) {
      this.renderer.removeClass(block11, 'fly-away');
    }
  }

  
}

