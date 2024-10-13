import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAccount } from "../modal-account/modal-account.component";
import { ModalWallet } from "../modal-wallet/modal-wallet.component";
import { Web3Service } from "../../services/web3.service";
import { Subscription, combineLatest } from 'rxjs';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ModalAccount,
    ModalWallet
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit, OnDestroy {
  showAccount: boolean = false;
  showWallet: boolean = false;
  isConnected: boolean = false;
  walletAddress: string = '';
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
      this.walletAddress = walletAddress;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  connectWallet() {
    this.web3Service.connectWallet("CoinBase Wallet");
  }

  shortedWalletAddress() {
    return this.walletAddress.substring(0, 6) + '...' + this.walletAddress.substring(38);
  }

  showAccountModal() {
    this.showAccount = true;
    setTimeout(() => {
      this.modalAccount.showModal();
    }, 100);
  }

  showWalletModal() {
    this.showWallet = true;
  }

  closeModal() {
    this.showAccount = false;
    this.showWallet = false;
  }

}
