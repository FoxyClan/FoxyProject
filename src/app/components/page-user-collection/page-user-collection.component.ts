import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-page-user-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-user-collection.component.html',
  styleUrl: './page-user-collection.component.css'
})
export class PageUserCollectionComponent implements OnInit {
  address: string | null = null; // Adresse Ethereum de la query param
  nfts: Array<{ id: number; image: string }> = []; // Liste de NFTs

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Récupérer la query parameter `address`
    this.route.queryParams.subscribe((params) => {
      this.address = params['address'] || null;
      if (this.address) {
        this.fetchNFTs(this.address); // Charger les NFTs liés à l'adresse
      } else {
        console.warn('No address provided in query params.');
      }
    });
  }

  fetchNFTs(address: string): void {
    // Remplace par un appel API réel
    console.log(`Fetching NFTs for address: ${address}`);
    this.nfts = [
      { id: 5100, image: 'https://example.com/nft1.png' },
      { id: 356, image: 'https://example.com/nft2.png' },
      { id: 789, image: 'https://example.com/nft3.png' },
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
