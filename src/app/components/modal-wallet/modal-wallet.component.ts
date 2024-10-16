import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import { Web3Service } from "../../services/web3.service";
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-wallet.component.html',
  styleUrl: './modal-wallet.component.css'
})
export class ModalWallet implements OnInit {
  @Output() close = new EventEmitter();
  public installedWallets: string[] = [];
  public allWallets: string[] = ["MetaMask", "CoinbaseWallet", "TrustWallet"];
  private subscription: Subscription;
  showInstallAll: boolean = false;

  constructor(private web3Service: Web3Service) {
    this.subscription = new Subscription();
    this.web3Service.detectInstalledWallets();
  }

  ngOnInit() {
    this.subscription = this.web3Service.installedWallets$.subscribe((installedWallets) => {
      this.installedWallets = installedWallets;
    });
  }
  
  closeModal() {
    this.close.emit();
  }

  stopEvent(event: Event) {
    event.stopPropagation();
  }

  connectWallet(wallet: string) {
    this.web3Service.connectWallet(wallet);
  }

  addSpaceBeforeW(input: string): string {
    return input.replace(/([a-zA-Z])W/g, '$1 W');
  }

  localStorageWallet(walletName: string) {
    const selected = localStorage.getItem('selectedWallet');
    return selected && selected == walletName;
  }

  showInstallWallet() {
    this.showInstallAll = true;
  }

}
