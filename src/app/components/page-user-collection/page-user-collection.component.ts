import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Web3Service } from "../../services/web3.service";
import axios from 'axios';
import { CacheService } from '../../services/cache.service';
import { ModalCollection } from "../modal-collection/modal-collection.component";
import { ModalMint } from "../modal-mint/modal-mint.component";
import { ErrorComponent } from "../page-error/error.component";
import Web3 from 'web3';
import { isAddress } from 'web3-validator';
import { TraitOptionsService } from '../../services/trait-options.service';


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
  imports: [CommonModule, ModalCollection, ModalMint, ErrorComponent],
  templateUrl: './page-user-collection.component.html',
  styleUrl: './page-user-collection.component.css'
})

export class PageUserCollectionComponent implements OnInit {
  @ViewChild(ModalMint) modalMint!: ModalMint;
  private baseUri: string = 'https://foxyclan.s3.filebase.com/';
  cacheVersion: string = '';
  private walletCheckedSubscription: any;
  isLoading: boolean = false;
  errorPage: boolean = false;

  address: string | null = null;
  walletAddress: string | null = null;
  isOwner: boolean = false;
  tokens: { [key: number]: Metadata | null } = {};
  selectedNFT: Metadata | null = null;
  rarities: { [key: number]: number } = {};

  userFoxyPoints: any = "Loading...";
  numberOfFoxys: any = "Loading...";
  noNft: boolean = false;
  showTooltip: boolean = false;

  selectedToken: Metadata | null = null
  showModal: boolean = false;
  showMergeModal: boolean = false;
  creatingNftLoading: boolean = false;

  mergeMode: boolean = false;
  availableTokens: { [key: number]: Metadata | null } = {}; // Liste des NFTs visibles dans la collection
  selectedNFTs: { left: Metadata | null, right: Metadata | null } = { left: null, right: null };
  profileImage: string | undefined = "";
  profilImageRarity: number = 101;
  errorMessage: any;

  constructor(private route: ActivatedRoute,
    private web3Service: Web3Service, 
    private cacheService : CacheService,
    private traitOptionsService: TraitOptionsService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.cacheService.cacheVersion$.subscribe((version) => {
      this.cacheVersion = version;
    });
    this.route.queryParams.subscribe((params) => {
      this.address = params['address'] || null;
      if (this.address && !isAddress(this.address)) {
        this.errorPage = true;
        return;
      }
    });
    this.web3Service.walletAddress$.subscribe((walletAddress) => {
      if (!walletAddress) return;
      const checksumAddress = Web3.utils.toChecksumAddress(walletAddress);
      this.walletAddress = checksumAddress;
      this.isOwner = this.walletAddress === this.address;
    });
    this.web3Service.creatingNftLoading$.subscribe((creatingNftLoading) => {
      this.creatingNftLoading = creatingNftLoading;
      if(creatingNftLoading) {
        this.showMergeModal = true;
      }
    });
    this.walletCheckedSubscription = this.web3Service.isWalletCheckedSubject$.subscribe(async (isWalletChecked) => {
      if(isWalletChecked) {
        if(!this.address) return
        try {
          await this.fetchNFTs(this.address);
          this.resetAvailableTokens();
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
    this.cacheService.updateCacheVersion();
    const result = await this.web3Service.tokenOfOwnerByIndex(address);
    if(result.length === 0) {
      this.noNft = true;
      return;
    }
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
        for (const tokenId in this.tokens) {
          if (this.tokens[tokenId]) {
            this.getRarity(this.tokens[tokenId]!);
          }
        }
      }
    }
  }

  getRarity(metadata: Metadata) {
    let total = 0;
    for(let item of metadata.attributes) {
      let index = this.getTraitIndex(item.value, item.trait_type);
      if (index === null) {
        console.error("Trait not found");
        index = 15;
      }
      total += index;
    }
    total = (total / 87 * 100);
    this.rarities[metadata.tokenId] = parseFloat(total.toFixed(1));
    if(this.rarities[metadata.tokenId] <= this.profilImageRarity) {
      this.profilImageRarity = this.rarities[metadata.tokenId];
      this.profileImage = metadata.image;
    }  
  }

  getTraitIndex(trait: string, type: string) {
    let options: any[] = [];
    switch (type.toLowerCase()) {
      case 'head covering':
        options = this.traitOptionsService.headCoveringOptions;
        break;
      case 'eyes':
        options = this.traitOptionsService.eyesOptions;
        break;
      case 'mouth':
        options = this.traitOptionsService.mouthOptions;
        break;
      case 'clothes':
        options = this.traitOptionsService.clothesOptions;
        break;
      case 'fur':
        options = this.traitOptionsService.furOptions;
        break;
      case 'background':
        options = this.traitOptionsService.backgroundOptions;
        break;
      default:
        console.error('Type de trait invalide:', type);
        return null;
    }
    const index = options.findIndex(option => option.name.toLowerCase() === trait.toLowerCase());
    return index !== -1 ? index : null;
  }

  openModal(token: Metadata | null) {
    if(!token || this.mergeMode) return
    this.selectedToken = token;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedToken = null;
  }



  /* MERGE */
  

  onDragStart(event: DragEvent, token: Metadata) {
  if (!event.dataTransfer) return;
  
  // Stocker les données du NFT
  event.dataTransfer.setData("text/plain", JSON.stringify(token));

  // Créer une prévisualisation personnalisée
  const img = new Image();
  img.src = token.image;
  img.style.width = "80px"; // Taille réduite de l'image
  img.style.height = "80px";
  img.style.borderRadius = "10px";
  img.style.position = "absolute";
  img.style.pointerEvents = "none"; // Évite les interférences avec l'événement drag
  
  document.body.appendChild(img);

  // Définir comme image de drag
  event.dataTransfer.setDragImage(img, 40, 40); // Position au centre

  // Nettoyage après le drag
  setTimeout(() => document.body.removeChild(img), 0);
}


  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, position: 'left' | 'right') {
    event.preventDefault();
    this.errorMessage = "";
    const data = event.dataTransfer?.getData("text/plain");
    
    if (data) {
      const nft: Metadata = JSON.parse(data);
      if (this.selectedNFTs.left?.tokenId === nft.tokenId || this.selectedNFTs.right?.tokenId === nft.tokenId) {
        console.warn("NFT déjà sélectionné !");
        return;
      }
      if (this.selectedNFTs[position]) {
        const removedNFT = this.selectedNFTs[position];
        this.availableTokens[removedNFT.tokenId] = removedNFT;
      }
      this.selectedNFTs[position] = nft;
      delete this.availableTokens[nft.tokenId];
    }
  }

  resetAvailableTokens() {
    this.availableTokens = { ...this.tokens };
  }

  getDropZoneClass(position: 'left' | 'right') {
    return this.selectedNFTs[position] ? 'drop-zone has-image' : 'drop-zone';
  }

  addToMerge(token: Metadata | null) {
    if(!token) return
    this.errorMessage = "";
    if (this.selectedNFTs.left?.tokenId === token.tokenId || this.selectedNFTs.right?.tokenId === token.tokenId) {
      console.warn("NFT déjà sélectionné !");
      return;
    }

    if (!this.selectedNFTs.left) {
      this.selectedNFTs.left = token;
    } else if (!this.selectedNFTs.right) {
      this.selectedNFTs.right = token;
    } else {
      console.warn("Les deux emplacements sont déjà remplis !");
      return;
    }
    delete this.availableTokens[token.tokenId];
  }

  removeFromMerge(position: 'left' | 'right') {
    const removedToken = this.selectedNFTs[position];
    this.errorMessage = "";
    if (removedToken) {
      this.availableTokens[removedToken.tokenId] = removedToken;
    }
    this.selectedNFTs[position] = null;
  }

  hasFreeSlot(): boolean {
    return !this.selectedNFTs.left || !this.selectedNFTs.right;
  }

  exitMergeMode() {
    this.errorMessage = "";
    this.mergeMode = false;
    this.selectedNFTs = { left: null, right: null };
    this.resetAvailableTokens();
  }

  async merge() {
    this.errorMessage = "";
    if (!this.selectedNFTs.left || !this.selectedNFTs.right) return //message erreur à afficher !!!!!!!!!!!!!!!!
    try {
      console.log("Merging NFTs:", this.selectedNFTs.left.tokenId, this.selectedNFTs.right.tokenId);
      const result = await this.web3Service.merge(this.selectedNFTs.left.tokenId, this.selectedNFTs.right.tokenId);
      const nftDataPromises = result.map(async (nft: { tokenId: number; image: string; metadata: any }) => {
        try {
          const response = {
            tokenId: nft.tokenId,
            image: nft.image, // L'image en base64
            metadata: nft.metadata // Métadonnées
          };
          return response;
        } catch (error) {
          console.error(`Erreur lors de la récupération des données pour le Token ID ${nft.tokenId}:`, error);
          return null;
        }
      });

      if(null === nftDataPromises || nftDataPromises.length === 0) {
        this.isLoading = false;
        return
      }

      const nftData = await Promise.all(nftDataPromises);
      const mergedNft = nftData.filter(data => data !== null);
      this.modalMint.merge(mergedNft);
    } catch(error: any) {
      console.error("Merging error:", error);
      this.errorMessage = error.message;
    }
  }

  async closeMergeModal() {
    this.errorMessage = "";
    this.showMergeModal = false;
    window.location.reload();
  }

}
