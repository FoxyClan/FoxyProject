import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from "../../services/web3.service";
import axios from 'axios';
import { CacheService } from '../../services/cache.service';
import { ModalCollection } from "../modal-collection/modal-collection.component";
import Web3 from 'web3';

interface Metadata {
  tokenId: number;
  image: string;
  DNA: string;
  name: string;
  description: string;
  attributes: Array<{
    value: string;
    trait_type: string;
  }>;
}

@Component({
  selector: 'app-page-user-collection',
  standalone: true,
  imports: [CommonModule, ModalCollection],
  templateUrl: './page-user-collection.component.html',
  styleUrl: './page-user-collection.component.css'
})

export class PageUserCollectionComponent implements OnInit {
  baseUri : string = 'https://foxyclan.s3.filebase.com/';
  cacheVersion: string = '';
  private walletCheckedSubscription: any;
  isLoading: boolean = false;

  address: string | null = null;
  walletAddress: string | null = null;
  isOwner: boolean = false;
  tokens: { [key: number]: Metadata | null } = {};
  selectedNFT: Metadata | null = null;

  userFoxyPoints: any = "Loading...";
  numberOfFoxys: any = "Loading...";
  noNft: boolean = false;
  showTooltip: boolean = false;

  selectedToken: Metadata | null = null
  showModal: boolean = false;

  mergeMode: boolean = false;
  selectedNFTs: { left: Metadata | null, right: Metadata | null } = { left: null, right: null };

  constructor(private route: ActivatedRoute,
    private web3Service: Web3Service, 
    private cacheService : CacheService,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.cacheService.cacheVersion$.subscribe((version) => {
      this.cacheVersion = version;
    });
    this.route.queryParams.subscribe((params) => {
      this.address = params['address'] || null;
    });
    this.web3Service.walletAddress$.subscribe((walletAddress) => {
      if (!walletAddress) return;
      const checksumAddress = Web3.utils.toChecksumAddress(walletAddress);
      this.walletAddress = checksumAddress;
      this.isOwner = this.walletAddress === this.address;
    });
    this.walletCheckedSubscription = this.web3Service.isWalletCheckedSubject$.subscribe(async (isWalletChecked) => {
      if(isWalletChecked) {
        if(!this.address) return
        try {
          await this.fetchNFTs(this.address);
          this.numberOfFoxys = Object.keys(this.tokens).length;
          const result = await this.web3Service.getUserPoints();
          this.userFoxyPoints =  Number(result);
        } catch (error) {
            this.noNft = true;
            throw error;
        } finally {
          this.walletCheckedSubscription.unsubscribe();
          this.isLoading = false;
        }
      }
    });
  }


  async fetchNFTs(address: string): Promise<void> {
    const result = await this.web3Service.tokenOfOwnerByIndex(address);
    if(result.length === 0) this.noNft = true;
    for (const tokenId of result) {
      try {
        const url = this.baseUri + tokenId + '.json';
        const response = await axios.get<Metadata>(url + `?t=${this.cacheVersion}`);
        this.tokens[tokenId] = response.data;
        this.tokens[tokenId].tokenId = tokenId;
      } catch (error) {
        console.error(`Failed to fetch data for token ${tokenId} : `, error);
        this.tokens[tokenId] = null;
      } finally {
      }
    }
  }

  openModal(token: Metadata) {
    this.selectedToken = token;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedToken = null;
  }

  /* MERGE */
  

// Événement déclenché lorsqu'on commence à glisser un NFT
onDragStart(event: DragEvent, token: Metadata) {
  event.dataTransfer?.setData("text/plain", JSON.stringify(token));
}

// Empêche le comportement par défaut pour permettre le drop
onDragOver(event: DragEvent) {
  event.preventDefault();
}

// Gère le dépôt d'un NFT dans un des cadrans
onDrop(event: DragEvent, position: 'left' | 'right') {
  event.preventDefault();
  const data = event.dataTransfer?.getData("text/plain");
  
  if (data) {
    const nft: Metadata = JSON.parse(data);

    // Vérifier que l'utilisateur ne dépose pas deux fois le même NFT
    if (this.selectedNFTs.left?.tokenId === nft.tokenId || this.selectedNFTs.right?.tokenId === nft.tokenId) {
      console.warn("NFT déjà sélectionné !");
      return;
    }

    this.selectedNFTs[position] = nft;
  }
}

getDropZoneClass(position: 'left' | 'right') {
  return this.selectedNFTs[position] ? 'drop-zone has-image' : 'drop-zone';
}


// Fonction merge (à adapter selon la logique de fusion)
merge() {
  if (this.selectedNFTs.left && this.selectedNFTs.right) {
    console.log("Merging NFTs:", this.selectedNFTs.left, this.selectedNFTs.right);
    
    // Ajoute ici l'appel backend pour effectuer la fusion
  }
}

}
