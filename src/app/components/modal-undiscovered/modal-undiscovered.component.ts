import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
import { ModalMint } from '../modal-mint/modal-mint.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-undiscovered',
  standalone: true,
  imports: [CommonModule, ModalMint],
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

  @ViewChild('modalDiscover') modalMint!: ModalMint;
  errorMessage: string = '';
  loading: boolean = false;
  creatingNftLoading: boolean = false;
  showMintModal: boolean = false;

  constructor(private web3Service: Web3Service) {}

  ngOninit() {
    this.web3Service.creatingNftLoading$.subscribe((creatingNftLoading) => {
      this.creatingNftLoading = creatingNftLoading;
      if(creatingNftLoading) {
        this.showMintModal = true;
      }
    });
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  closeMintModal() {
    this.showMintModal = false;
  }

  async discover() {
    if(this.loading) return
    this.loading = true;
    try {
      console.log("Discovering Foxy #" + this.tokenId);
      const result = await this.web3Service.discoverNft(this.tokenId);
      console.log(result)
      if (!result) {
        this.closeMintModal();
        this.errorMessage = "Error retrieving discovered token";
        return;
      } 
      const nftData = {
        tokenId: result.tokenId,
        image: result.image, // Image en base64
        metadata: result.metadata // Métadonnées
      };
      this.modalMint.unveilNft(nftData);
    } catch(error: any) {
      console.error("Discover error:", error);
      this.errorMessage = error.message;
    } finally {
      this.loading = false;
    }
  }

}