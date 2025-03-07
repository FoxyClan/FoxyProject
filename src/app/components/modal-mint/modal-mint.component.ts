import { Component, Output, EventEmitter, OnInit, OnDestroy, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Web3Service } from "../../services/web3.service";
import { CacheService } from "../../services/cache.service";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TraitOptionsService } from '../../services/trait-options.service';

@Component({
  selector: 'app-modal-mint',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './modal-mint.component.html',
  styleUrl: './modal-mint.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void => *', [
        animate('500ms ease-in-out')
      ]),
      transition('* => void', [
        animate('500ms ease-in-out')
      ])
    ])
  ]
})

export class ModalMint implements OnInit, OnDestroy {
  @Output() close = new EventEmitter();
  @Input() isAllowList: boolean = false;
  
  private walletAddressSubscription: Subscription | null = null;
  actualSupply: any = "Load...";
  currentSaleMinted: any = "Load...";
  saleMintLimit: any = "Load...";
  numAvailableToMint: any = "Load...";
  isPrivateSaleActive: boolean = false;
  mintPrice: number = 0.0125;
  privateMintPrice: number = 0.0075;
  
  counterValue: number = 1;
  isLoading: boolean = false;
  errorMessage: string = "";
  successMessage: string = "";
  success: boolean = false;
  discover: boolean = false; // Deux secondes apres success
  errorAfterMint: boolean = false;

  lightBackgroundAnimation: boolean = false; // Video d'animation qui defile
  showButton: boolean = true; // Pour montrer le bouton de discover
  showAddWalletButton: boolean = false; // Pour montrer le bouton add wallet

  effect: String = '';

  isUnblurred: boolean = false; // Blur du nft
  isSpinning: boolean = false;
  showMetadata: boolean = false;
  lastLeaveTime: number | null = null; // Stocke le moment où la souris quitte la boîte
  blockAnimation: boolean = false; // Bloque l'animation temporairement
  closeAnimation: boolean = false;

  private subscription: Subscription;
  creatingNftLoading: boolean = false;

  mintedNfts: {   // Déclaration du tableau qui contient les images et les métadonnées
    tokenId: number;
    image: string;           // L'image en base64
    metadata: {             // Métadonnées associées au NFT
      name: string;
      description: string;
      image: string;
      attributes: {          // Liste des attributs du NFT
        trait_type: string;
        value: string;
      }[];
    };
  }[] = [];  // Initialisation comme un tableau vide
  tokenIndex: number = 0;

  isInteractive = false; // Contrôle si l'interaction est activée
  private animationFrame: number | null = null;
  private lastCallTime = 0;

  asTranscendence: boolean = false;

  constructor(private web3Service: Web3Service,
    private cacheService: CacheService,
    private traitOptionsService: TraitOptionsService) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.walletAddressSubscription = this.web3Service.walletAddress$.subscribe((isReady) => {
      if (isReady) {
        this.initializeMintData();
      }
    });
  }

  private initializeMintData() {
    this._supply();
    this._saleMintLimit();
    this._currentSaleMint();
    this._numAvailableToMint();
    this._privateSaleIsActive();
    this.subscription = this.web3Service.creatingNftLoading$.subscribe((creatingNftLoading) => {
      this.creatingNftLoading = creatingNftLoading;
    });
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.walletAddressSubscription?.unsubscribe();
    this.isLoading = false;
    this.successMessage = "";
    this.success = false;
    this.discover = false;
    this.errorAfterMint = false;
    this.lightBackgroundAnimation = false;
    this.showButton = true;
    this.showAddWalletButton = false;
    this.effect = '';
    this.isUnblurred = false;
    this.isSpinning = false;
    this.showMetadata = false;
    this.lastLeaveTime = null;
    this.blockAnimation = false;
    this.closeAnimation = false;
    this.mintedNfts = [];
    this.tokenIndex = 0;
  }

  closeModal() {
    if(this.isLoading || this.creatingNftLoading) return
    if(this.success && !this.discover) return
    this.errorMessage = "";
    this.counterValue = 1;
    if(!this.success) {
      this.close.emit();
      this.ngOnDestroy();
      return;
    }
    this.closeAnimation = true;
    setTimeout(() => {
      this.close.emit();
      this.ngOnDestroy();
    }, 500);
  }
  

  onMouseMove(event: MouseEvent): void {
    if(!this.isInteractive) return
    const now = performance.now();

    // Si l'animation est bloquée, ne pas relancer immédiatement
    if (this.blockAnimation) return;

    if (now - this.lastCallTime < 32) return; // Limite à ~30 FPS
    this.lastCallTime = now;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      const box = document.querySelector('.box') as HTMLElement;
      if (!box) return;

      const rect = box.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const offsetX = (mouseX - centerX) / centerX;
      const offsetY = (mouseY - centerY) / centerY;

      const rotateX = offsetY * 30;
      const rotateY = offsetX * -30;

      box.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  }

  onMouseLeave(): void {
    if(!this.isInteractive) return

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    const box = document.querySelector('.box') as HTMLElement;
    if (box) {
      box.style.transform = `rotateX(0deg) rotateY(0deg)`; // Réinitialiser la transformation
    }

    // Bloque l'animation pour 0.5 seconde
    this.blockAnimation = true;
    this.lastLeaveTime = performance.now();

    setTimeout(() => {
      const now = performance.now();
      if (this.lastLeaveTime && now - this.lastLeaveTime >= 300) {
        this.blockAnimation = false; // Débloque l'animation après 0.5 seconde
      }
    }, 300); // Délai de 0.5 seconde
  }

  stopEvent(event: Event) {
    event.stopPropagation();
  }

  increase() {
    if (this.counterValue < 20) {
      this.counterValue++;
    }
  }

  decrease() {
    if (this.counterValue > 1) {
      this.counterValue--;
    }
  }

  onInputChange() {
    if (this.counterValue < 1) {
      this.counterValue = 1;
    }
    if (this.counterValue > 20) {
      this.counterValue = 20;
    }
  }


  async mintNFT(numberOfTokens: number) {
    this.isLoading = true;
    this.errorMessage = "";
    this.successMessage = `Minting successful ! You minted ${numberOfTokens} NFT` + (numberOfTokens > 1 ? 's.' : '.');
    this.discover = false;
    try {
      if(this.saleMintLimit !== 0 && this.saleMintLimit - this.currentSaleMinted < numberOfTokens) throw new Error("Minting limit for this sale reached")
      const result = this.isAllowList ? await this.web3Service.mintAllowList(numberOfTokens) : await this.web3Service.mint(numberOfTokens);
      console.info('Minting successful : ' + numberOfTokens + ' token(s) minted');
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
        this.errorAfterMint = true;
        this.isLoading = false;
        return
      }
      const nftData = await Promise.all(nftDataPromises);
      this.mintedNfts = nftData.filter(data => data !== null);
      this.success = true;
      setTimeout(() => {
        this.discover = true; // attend que le block.success grandisse pour apparaitre
      }, 2000); 
    } catch (error: any) {
      console.error("Minting error:", error);
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
      this.cacheService.updateCacheVersion();
    }
  }
  

  private async _supply() {
    try {
      const result = await this.web3Service.Supply();
      this.actualSupply = Number(result)
    } catch (error) {
      console.error("Supply error:", error);
    }
  }

  private async _currentSaleMint() {
    try {
       const result = await this.web3Service.currentSaleMinted();
       this.currentSaleMinted = Number(result);
    } catch (error) {
       console.error("currentSaleMinted error:", error);
    }
  }

  
  private async _saleMintLimit() {
    try {
       const result = await this.web3Service.saleMintLimit();
       this.saleMintLimit = Number(result);
    } catch (error) {
       console.error("saleMintLimit error:", error);
    }
  }

  private async _numAvailableToMint() {
    try {
       const result = await this.web3Service.numAvailableToMint();
       this.numAvailableToMint = Number(result);
    } catch (error) {
       console.error("numAvailableToMint error:", error);
    }
  }

  private async _privateSaleIsActive() {
    try {
       const result = await this.web3Service.privateSaleIsActive();
       this.isPrivateSaleActive = Boolean(result);
    } catch (error) {
       console.error("privateSaleIsActive fail to fetch:", error);
    }
  }



  /* AFTER MINT */

  animateButton(event: Event) {
    const button = event.target as HTMLElement;
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 500);
  }

  discoverNFT() {
    this.isInteractive = false;
    setTimeout(() => {
      this.showButton = false; // For the button animation
    }, 500);
    const box = document.querySelector(".box") as HTMLElement;
    if (!box) return;
    const handleAnimationEnd = (currentRotation: number) => {
      
      if (currentRotation === 180) {
        box.classList.add("rotateFix");
        box.addEventListener("animationend", function rotateFixEnd() {
          box.classList.remove("rotateFix");
          box.removeEventListener("animationend", rotateFixEnd);
          box.classList.add("spinning");
          startCrescendoDecrescendo();
        });
      } else {
        box.classList.add("spinning");
        startCrescendoDecrescendo();
      }
    };
    const startCrescendoDecrescendo = () => {
      this.playAnimation();
      setTimeout(() => {
        box.classList.remove("spinning");
        box.style.animation = "none"; // Fixe l'élément à sa position finale
        box.style.transform = "rotateY(1080deg)"; // Position finale
        this.isInteractive = true;
      }, 7000); // Durée de crescendoDecrescendo
    };
    const intervalId = setInterval(() => {
      const currentRotation = Math.round(this.getCurrentRotation(box));
      if (currentRotation > -5 && currentRotation < 5) {
        clearInterval(intervalId);
        handleAnimationEnd(0);
      } else if (currentRotation > 175 && currentRotation < 185) {
        clearInterval(intervalId);
        handleAnimationEnd(180);
      }
    }, 25);
    
      
  }

  addNFT() {
    if(this.mintedNfts.length === this.tokenIndex + 1) {
      this.closeModal();
      this.web3Service.clearTmpDirectory();
      return;
    }
    this.isInteractive = false;
    const box = document.querySelector(".box") as HTMLElement;
    const image = document.getElementById("nft") as HTMLElement;

    if (!box || !image) {
      console.error("Element .box ou .nft-adn introuvable.");
      return;
    }
    image.style.transition = "none";
    image.classList.add("blurred");
    
    setTimeout(() => {
      image.style.transition = '';
    }, 0);

    box.classList.remove("rotateFix", "spinning");
    box.style.transform = "";
    box.style.animation = "";
  
    this.isUnblurred = false;
    this.showMetadata = false;
    this.tokenIndex++;
    setTimeout(() => {
      this.showAddWalletButton = false; // For the button animation
    }, 500);
  }
    
  

  getCurrentRotation(element: HTMLElement): number {
    const computedStyle = window.getComputedStyle(element);
    const transform = computedStyle.transform;
    if (transform === "none" || !transform) return 0;
    const matrixValues = transform.match(/matrix\((.+)\)/) || transform.match(/matrix3d\((.+)\)/);
    if (!matrixValues || !matrixValues[1]) return 0;
    const values = matrixValues[1].split(", ").map(parseFloat);
    if (transform.startsWith("matrix3d")) {
      const angleY = Math.atan2(values[2], values[0]);
      return (angleY * 180) / Math.PI;
    } else {
      const angle = Math.atan2(values[1], values[0]);
      return (angle * 180) / Math.PI;
    }
  }
  

  playAnimation() {
    // start light background
    this.lightBackgroundAnimation = true;
    this.isUnblurred = true;

    // start effect
    setTimeout(() => {
      let rarity = 0;

      for(let attribute of this.mintedNfts[this.tokenIndex]?.metadata?.attributes) {
        const trait = this.getTraitRarity(attribute.value, attribute.trait_type);
        if (attribute.trait_type == "Transcendence") {
          this.asTranscendence = true;
          rarity -= 1;
        }
        else if (trait === "legendary") rarity += 1;
        else if (trait === "epic") rarity += 2;
        else if (trait === "rare") rarity += 3;
        else rarity += 4;
      }
      console.log(rarity)
      if (rarity <= 15) this.effect = 'legendary';
      else if (rarity <= 17) this.effect = 'epic';
      else if (rarity <= 19) this.effect = 'rare';
      else this.effect = "";
    }, 2000);

    // stop light background
    setTimeout(() => {
      this.stopVideo();
      this.lightBackgroundAnimation = false;
      this.showMetadata = true;
    }, 6900); // 100ms before 7s to fix bug

    // stop effect
    setTimeout(() => {
      this.effect = '';
    }, 9000);
  }

  stopVideo() {
    this.showButton = true;
    if (!this.showAddWalletButton) this.showAddWalletButton = true;
  }

  getTraitRarity(trait: string, type: string) {
    const index = this.traitOptionsService.getTraitIndex(trait, type);
    if (index === null) {
      console.error("Trait not found");
      return "";
    }
    if (index <= 2) return "legendary";
    if (index <= 5) return "epic";
    if (index <= 8) return "rare";
    return "";
  }

  

  /* MERGE */

  merge(mergedNft: any) {
    this.mintedNfts = mergedNft;
    this.success = true;
    setTimeout(() => {
      this.discover = true; // attend que le block.success grandisse pour apparaitre
    }, 2000);
  }
}
