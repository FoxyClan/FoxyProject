import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotConnectedModal } from '../modal-not-connected/not-connected.component';
import { combineLatest, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Web3Service } from "../../services/web3.service";
import { ModalMint } from "../modal-mint/modal-mint.component";
import Web3 from 'web3';

@Component({
  selector: 'app-mint',
  standalone: true,
  imports: [
    NotConnectedModal,
    CommonModule,
    ModalMint],
  templateUrl: './mint.component.html',
  styleUrl: './mint.component.css'
})

export class MintComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  private isConnected: boolean = false;
  walletAddress: any;

  showMint: boolean = false;

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
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  showMintModal() {
    this.showMint = true;
  }

  closeMintModal() {
    this.showMint = false;
  }

  getConnected() {
    return this.isConnected;
  }

  

  async merge() {
    try {
      const result = await this.web3Service.merge(0, 1);
      console.log("Merge successful:", result);
    } catch (error) {
      console.error("Merge error:", error);
    }
  }

  async flipSale() {
    try {
      const result = await this.web3Service.flipPublicSaleState();
      console.log("Fliping successful:", result);
    } catch (error) {
      console.error("Fliping error:", error);
    }
  }

  async balanceOf() {
    if (!this.walletAddress) {
       console.error("Wallet address not available");
       return;
    }
    try {
       const result = await this.web3Service.balanceOf(this.walletAddress);
       console.log("Balance:", Number(result));
    } catch (error) {
       console.error("Balance error:", error);
    }
 }
 

    
}
