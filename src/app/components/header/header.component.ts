import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAccount } from "../modal-account/modal-account.component";
import { ModalWallet } from "../modal-wallet/modal-wallet.component";
import { Web3Service } from "../../services/web3.service";
import { Subscription, combineLatest } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import Web3 from 'web3';
import axios from "axios";
import { ModalCollection } from "../modal-collection/modal-collection.component";

interface Metadata {
  tokenId: number;
  image: string;
  DNA: string;
  name: string;
  description: string;
  attributes: Array<{ value: string; trait_type: string }>;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ModalAccount,
    ModalWallet,
    RouterLink,
    ModalCollection
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  showAccount: boolean = false;
  showWallet: boolean = false;
  isConnected: boolean = false;
  walletAddress: any;
  
  selectedToken: Metadata | null = null
  showModal: boolean = false;

  isLoading: boolean = false;
  searchQuery: string = '';
  searchIconColor: string = "assets/images/search.png";

  @ViewChild('ModalAccount') modalAccount! : ModalAccount;
  @ViewChild('ModalWallet') modalWallet! : ModalWallet;

  constructor(private web3Service: Web3Service, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    combineLatest([
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

  isActive(route: string): boolean {
    return this.router.url === route || (route === '/home' && (this.router.url === '' || this.router.url === '/')) || this.redirected(route);
  }

  redirected(route: string): boolean {
    if (route === '/collection') {
      return this.route.snapshot.queryParams['trait'] ? true : this.route.snapshot.url.join('') === route;
    }
    return this.route.snapshot.url.join('') === route;
  }


  /* SEARCH BAR */

  onSearchInput(event: Event) {
    this.removeBorderRed();
    this.searchQuery = (event.target as HTMLInputElement).value;
  }
  
  // Fonction pour rechercher un token
  async searchToken() {
    this.removeBorderRed();
    if (!this.searchQuery.trim()) return;
  
    this.isLoading = true;
    this.searchIconColor = "assets/images/search.png"; // Remettre l'icône par défaut
  
    const tokenId = this.searchQuery.trim();
    const tokenUri = `https://foxyclan.s3.filebase.com/`;
  
    const bucketResponse = await axios.get(tokenUri, { responseType: 'text' });
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(bucketResponse.data, 'application/xml');
    const keys = Array.from(xmlDoc.getElementsByTagName('Key')).map(node => node.textContent || '');
    const jsonFiles = keys.filter(key => key.endsWith('.json'));
    const metadataKey = `${tokenId}.json`;

    if (jsonFiles.includes(metadataKey)) {
      const response = await axios.get<Metadata>(`${tokenUri}${metadataKey}`);
      const metadata = response.data;
      metadata.tokenId = parseInt(tokenId);
      this.selectedToken = metadata;
      console.log(metadata)
      this.openCollectionModal();
    }
    else {
      const bar = document.querySelector('.search-bar');
      if (bar) {
        bar.classList.add('border-red');
      }

    }
    this.isLoading = false;
  }

  removeBorderRed() {
    const bar = document.querySelector('.search-bar');
    if (bar) {
      bar.classList.remove('border-red');
    }
  }
  

  openCollectionModal() {
    this.showModal = true;
  }

  closeCollectionModal() {
    this.showModal = false;
  }


}
