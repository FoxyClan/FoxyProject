import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from "../../services/web3.service";
import axios from 'axios';
import { CacheService } from '../../services/cache.service';

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
  imports: [CommonModule],
  templateUrl: './page-user-collection.component.html',
  styleUrl: './page-user-collection.component.css'
})
export class PageUserCollectionComponent implements OnInit {
  baseUri : string = 'https://foxyclan.s3.filebase.com/';
  cacheVersion: string = '';

  address: string | null = null;
  walletAddress: string | null = null;
  isOwner: boolean = false;
  tokens: { [key: number]: Metadata | null } = {};
  selectedNFT: Metadata | null = null;

  foxypoints: number = 50;
  numberOfFoxys: number = 10;

  constructor(private route: ActivatedRoute, private router: Router, private web3Service: Web3Service, private cacheService : CacheService,) {}

  ngOnInit(): void {
    this.cacheService.cacheVersion$.subscribe((version) => {
      this.cacheVersion = version;
    });
    this.route.queryParams.subscribe((params) => {
      this.address = params['address'] || null;
      if (this.address) {
        this.fetchNFTs(this.address);
      } else {
        console.warn('No address provided in query params.');
      }
    });
    this.web3Service.walletAddress$.subscribe((walletAddress) => {
      this.walletAddress = walletAddress;
      if(this.walletAddress === this.address) this.isOwner = true;
    });
  }


  async fetchNFTs(address: string): Promise<void> {
    const result = await this.web3Service.tokenOfOwnerByIndex(address);
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

  viewNFT(): void {
    console.log('Viewing NFT:');
    // Implémente la logique pour afficher plus de détails si nécessaire
  }

  navigateToHome() {
    this.router.navigate(['/']); // Exemple : retour à la page d'accueil
  }
}
