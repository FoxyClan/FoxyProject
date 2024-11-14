import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAccount } from "../modal-account/modal-account.component";
import { ModalWallet } from "../modal-wallet/modal-wallet.component";
import { Web3Service } from "../../services/web3.service";
import { Subscription, combineLatest } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import Web3 from 'web3';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ModalAccount,
    ModalWallet,
    RouterLink
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit, OnDestroy {
  showAccount: boolean = false;
  showWallet: boolean = false;
  isConnected: boolean = false;
  walletAddress: any;
  private subscription: Subscription;

  @ViewChild('ModalAccount') modalAccount! : ModalAccount;
  @ViewChild('ModalWallet') modalWallet! : ModalWallet;

  constructor(private web3Service: Web3Service) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.subscription = combineLatest([
      this.web3Service.isConnected$,
      this.web3Service.walletAddress$
    ]).subscribe(([isConnected, walletAddress]) => {
      this.isConnected = isConnected;
      if(walletAddress) {
        const checksumAddress = Web3.utils.toChecksumAddress(walletAddress);
        this.walletAddress = checksumAddress;
      }
      if (typeof document !== 'undefined') {
        const button = document.getElementById("walletAddressButton");
        if(button) button.textContent = (this.walletAddress.substring(0, 6) + '...' + this.walletAddress.substring(38));
      }
      if(isConnected) {
        this.showWallet = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  connectWallet() {
    this.web3Service.connectWallet("CoinBase Wallet");
  }

  showAccountModal() {
    this.showAccount = true;
    setTimeout(() => {
      this.modalAccount.showModal();
    }, 100);
  }

  showWalletModal() {
    this.showWallet = true;
    setTimeout(() => {
      this.modalWallet.showModal();
    }, 0);
  }

  closeModal() {
    this.showAccount = false;
    this.showWallet = false;
  }


}
