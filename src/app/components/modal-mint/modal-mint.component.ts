import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Web3Service } from "../../services/web3.service";
import { ProgressService } from "../../services/progress.service";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from 'rxjs';

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
  counterValue: number = 1;
  actualSupply: any = "Load...";
  private intervalId: any;
  isLoading: boolean = false;
  errorMessage: string = "";
  successMessage: string = "";
  success: boolean = false; // Montre le 
  discover: boolean = false; // Deux secondes apres success
  isAnimationPlaying: boolean = false; // Video d'animation qui defile
  showButton: boolean = true; // Pour montrer le bouton de discover
  isLegendaryVideoPlaying: boolean = false;
  isUnblurred: boolean = false; // Blur du nft
  isSpinning: boolean = false;
  rotationSpeed: string = "5s";
  showMetadata: boolean = false;
  progress: number = 0;

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

  constructor(private web3Service: Web3Service, private progressService: ProgressService) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.Supply();
    }, 5000);
  
    this.Supply();
    this.subscription = this.web3Service.creatingNftLoading$.subscribe((creatingNftLoading) => {
      this.creatingNftLoading = creatingNftLoading;
    });
  
    const sessionId = this.generateSessionId();
    this.progressService.subscribeToProgress(sessionId, (progress: number) => {
      console.log("hey")
      this.progress = progress;
      console.log(`Progress updated: ${this.progress}`);
    });
  }

  private generateSessionId(): string {
    return uuidv4(); // Génère un identifiant unique
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.subscription.unsubscribe();
  }

  closeModal() {
    if(!this.isLoading) this.close.emit();
  }
  

  onMouseMove(event: MouseEvent): void {
    const now = performance.now();
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
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    const box = document.querySelector('.box') as HTMLElement;
    if (box) {
      box.style.transform = ''; // Réinitialiser la transformation
    }
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
      const result = await this.web3Service.mint(numberOfTokens);
      const nftDataPromises = result.map(async (nft: { tokenId: number; image: string; metadata: any }) => {
        try {
          // Utilisez les valeurs de l'objet nft (tokenId, image, metadata)
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

      // Attendre que toutes les promesses soient résolues
      const nftData = await Promise.all(nftDataPromises);

      // Filtrer les résultats valides (pas de null)
      this.mintedNfts = nftData.filter(data => data !== null);

      this.success = true;
      setTimeout(() => {
        this.discover = true; // attend que le block.success grandisse pour apparaitre
      }, 2000); 
    } catch (error) {
      console.error("Minting error:", error);
      this.errorMessage = "Transaction failed. Please try again.";
    } finally {
      this.isLoading = false;
    }
  }

  async Supply() {
    try {
      const result = await this.web3Service.Supply();
      this.actualSupply = Number(result)
    } catch (error) {
      console.error("Supply error:", error);
    }
  }

  DiscoverEffect() {
    this.isInteractive = false;
    this.showButton = false;
    const box = document.querySelector(".box") as HTMLElement;

    if (!box) {
      return;
    }

    const handleAnimationEnd = () => {
      box.removeEventListener("animationiteration", handleAnimationEnd);
  
      // Récupérer la rotation actuelle
      const currentRotation = Math.round(this.getCurrentRotation(box));
  
      if (currentRotation === 180) {
        // Ajouter l'animation rotateFix
        box.classList.add("rotateFix");
        // Attendre la fin de rotateFix avant de lancer crescendoDecrescendo
        box.addEventListener(
          "animationend",
          function rotateFixEnd() {
            box.classList.remove("rotateFix");
            box.removeEventListener("animationend", rotateFixEnd);
  
            box.classList.add("spinning");
            startCrescendoDecrescendo();
          }
        );
      } else {
        box.classList.add("spinning");
        startCrescendoDecrescendo();
      }
    };
  
    const startCrescendoDecrescendo = () => {
      this.playVideo();
  
      // Supprimer crescendoDecrescendo après sa durée
      setTimeout(() => {
        box.classList.remove("spinning");
        box.style.animation = "none"; // Fixe l'élément à sa position finale
        box.style.transform = "rotateY(1080deg)"; // Position finale
        this.isInteractive = true;
      }, 7000); // Durée de crescendoDecrescendo
    };
  
    // Ajouter un écouteur pour attendre la fin d'un cycle d'animation
    box.addEventListener("animationiteration", handleAnimationEnd);
  }

  getCurrentRotation(element: HTMLElement): number {
    const computedStyle = window.getComputedStyle(element);
    const transform = computedStyle.transform;
  
    if (transform === "none" || !transform) {
      return 0; // Pas de transformation appliquée
    }
  
    // Vérifier si c'est une matrice 3D ou 2D
    const matrixValues = transform.match(/matrix\((.+)\)/) || transform.match(/matrix3d\((.+)\)/);
  
    if (!matrixValues || !matrixValues[1]) {
      return 0;
    }
  
    // Extraire les valeurs de la matrice
    const values = matrixValues[1].split(", ").map(parseFloat);
  
    if (transform.startsWith("matrix3d")) {
      // Pour une matrice 3D, la rotation Y est liée à la composante [0][0] et [2][0]
      const angleY = Math.atan2(values[2], values[0]);
      return (angleY * 180) / Math.PI; // Convertir en degrés
    } else {
      // Pour une matrice 2D, la rotation est liée à [0][1] et [0][0]
      const angle = Math.atan2(values[1], values[0]);
      return (angle * 180) / Math.PI; // Convertir en degrés
    }
  }
  
  
  

  playVideo() {
    this.isAnimationPlaying = true;
    this.isUnblurred = true;

    setTimeout(() => {
      this.isLegendaryVideoPlaying = true;
    }, 2000);


    setTimeout(() => {
      this.stopVideo();
      this.isAnimationPlaying = false;
      this.showMetadata = true;
    }, 7000);

    setTimeout(() => {
      this.stopRarityVideo();
    }, 9000);
  }

  stopVideo() {
    this.showButton = true;
  }

  stopRarityVideo() {
    this.isLegendaryVideoPlaying = false;
  }

  getBorderClass(value: string): { [key: string]: boolean } {
    return { 'gold-border': value === '1' || value === '2' || value === '3' };
}

}
