import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalWallet } from '../modal-wallet/modal-wallet.component';

@Component({
  selector: 'app-not-connected',
  standalone: true,
  imports: [CommonModule, ModalWallet],
  templateUrl: './not-connected.component.html',
  styleUrl: './not-connected.component.css'
})
export class NotConnectedModal {
  showWallet: boolean = false;

  connectWallet() {
    this.showWallet = true;
  }

  closeModal() {
    this.showWallet = false;
  }
}