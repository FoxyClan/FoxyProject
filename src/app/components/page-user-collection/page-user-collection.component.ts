import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from "../../services/web3.service";

@Component({
  selector: 'app-page-user-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-user-collection.component.html',
  styleUrl: './page-user-collection.component.css'
})
export class PageUserCollectionComponent implements OnInit {
  address: string | null = null;
  walletAddress: string | null = null;
  isOwner: boolean = false;

  foxypoints: number = 50;
  numberOfFoxys: number = 10;
  nfts: Array<{ id: number; image: string }> = [];

  constructor(private route: ActivatedRoute, private router: Router, private web3Service: Web3Service) {}

  ngOnInit(): void {
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

  fetchNFTs(address: string): void {
    // Remplace par un appel API réel
    console.log(`Fetching NFTs for address: ${address}`);
    this.nfts = [
      { id: 5100, image: 'https://foxyclan.s3.filebase.com/0.png' },
      { id: 356, image: 'https://foxyclan.s3.filebase.com/0.png' },
      { id: 789, image: 'https://foxyclan.s3.filebase.com/0.png' },
    ]; // Exemple mocké
  }

  viewNFT(nft: { id: number; image: string }): void {
    console.log('Viewing NFT:', nft);
    // Implémente la logique pour afficher plus de détails si nécessaire
  }

  navigateToHome() {
    this.router.navigate(['/']); // Exemple : retour à la page d'accueil
  }
}
