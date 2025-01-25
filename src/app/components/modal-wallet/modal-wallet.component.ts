import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import { Web3Service } from "../../services/web3.service";
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { log } from 'node:console';

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

  isAnimated: boolean = false;
  showHome: boolean = true;
  showInstallAll: boolean = false;
  showInstallMetamask: boolean = false;
  showInstallTrust: boolean = false;
  showInstallCoinbase: boolean = false;

  constructor(private web3Service: Web3Service) {
    this.subscription = new Subscription();
    this.web3Service.detectInstalledWallets();
  }

  ngOnInit() {
    this.subscription = this.web3Service.installedWallets$.subscribe((installedWallets) => {
      this.installedWallets = installedWallets;
      console.log("yooo")
    });
  }

  showModal() {
    this.isAnimated = true;
  }
  
  closeModal() {
    this.isAnimated = false;
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

  walletDesciption(wallet: string) {
    if(wallet == null) return
    switch(wallet) {
      case "MetaMask" : return "Wallet pour navigateur le plus utilisé" 
      case "CoinbaseWallet" : return "Wallet lié à Coinbase"
      case "TrustWallet" : return "Wallet pour mobile et navigateur"
      default: return
    }
  }

  active(activeSlide: string) {
    this.showHome = false;
    this.showInstallAll = false;
    this.showInstallMetamask = false;
    this.showInstallCoinbase = false;
    this.showInstallTrust = false;

    switch(activeSlide) {
      case 'showHome':
          this.showHome = true;
          break;
      case 'showInstallAll':
          this.showInstallAll = true;
          break;
      case 'MetaMask':
          this.showInstallMetamask = true;
          break;
      case 'CoinbaseWallet':
          this.showInstallCoinbase = true;
          break;
      case 'TrustWallet':
          this.showInstallTrust = true;
          break;
      default:
          console.warn('Aucun cas géré pour: ' + activeSlide);
          this.showHome = true;
          break;
    }
  }

}
