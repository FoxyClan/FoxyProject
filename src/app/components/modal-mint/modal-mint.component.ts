import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-mint',
  standalone: true,
  imports: [],
  templateUrl: './modal-mint.component.html',
  styleUrl: './modal-mint.component.css'
})
export class ModalMint {
  @Output() close = new EventEmitter();

  closeModal() {
    this.close.emit();
  }
  
  stopEvent(event: Event) {
    event.stopPropagation();
  }
}
