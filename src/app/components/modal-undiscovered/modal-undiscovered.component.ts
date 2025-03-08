import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-undiscovered',
  standalone: true,
  imports: [],
  templateUrl: './modal-undiscovered.component.html',
  styleUrl: './modal-undiscovered.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0, transform: 'scale(0.9)' })),
      transition(':enter', [
        animate('300ms ease-in-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class UndiscoveredModal {
  @Input() image: string = '';
  @Input() tokenId: number = 0;
  @Output() closeModalEvent = new EventEmitter<void>();

  closeModal() {
    this.closeModalEvent.emit();
  }

  undiscoverNFT() {
    console.log('Undiscover NFT action triggered for token', this.tokenId);
    // Ajoute ici la logique pour révéler le NFT
  }

}