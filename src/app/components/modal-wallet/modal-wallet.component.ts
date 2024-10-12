import { Component, Output, EventEmitter } from '@angular/core';
import { Web3Service } from "../../services/web3.service";

@Component({
  selector: 'app-modal-wallet',
  standalone: true,
  imports: [],
  templateUrl: './modal-wallet.component.html',
  styleUrl: './modal-wallet.component.css'
})
export class ModalWallet {
  @Output() close = new EventEmitter();

  constructor(private web3Service: Web3Service) {

  }
  closeModal() {
    this.close.emit();
  }

  stopEvent(event: Event) {
    event.stopPropagation();
  }

  connectWallet() {
    this.web3Service.connectWallet("CoinBase Wallet");
  }

}
