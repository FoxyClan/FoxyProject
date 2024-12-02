import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Web3Service } from "../../services/web3.service";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-mint',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './modal-mint.component.html',
  styleUrl: './modal-mint.component.css'
})
export class ModalMint implements OnInit, OnDestroy {
  @Output() close = new EventEmitter();
  counterValue: number = 1;
  actualSupply: any = "Load...";
  private intervalId: any;
  isLoading: boolean = false;
  errorMessage: string = "";
  successMessage: string = "";
  discover: boolean = true;
  isVideoPlaying: boolean = false;
  isLegendaryVideoPlaying: boolean = false;
  isUnblurred: boolean = false;
  isSpinning: boolean = false;
  rotationSpeed: string = "5s";

  constructor(private web3Service: Web3Service) {
  }

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.Supply();
    }, 5000);
    this.Supply();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  closeModal() {
    if(!this.isLoading) this.close.emit();
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
    this.successMessage = "";
    this.discover = false;
    try {
      const result = await this.web3Service.mint(numberOfTokens);
      console.log("Minting successful:", result);
      this.successMessage = `Minting successful! You minted ${numberOfTokens} NFT` + (numberOfTokens > 1 ? 's.' : '.');
      this.discover = true;
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

  startSpinEffect() {
    const box = document.querySelector(".box") as HTMLElement;

    if (!box) {
      console.error("Element '.box' not found!");
      return;
    }

    const handleAnimationEnd = () => {
      box.removeEventListener("animationiteration", handleAnimationEnd);
  
      // Récupérer la rotation actuelle
      const currentRotation = Math.round(this.getCurrentRotation(box));
      console.log(`Rotation actuelle : ${currentRotation} degrés`);
  
      if (currentRotation === 180) {
        console.log("Lancement de rotateFix...");
  
        // Ajouter l'animation rotateFix
        box.classList.add("rotateFix");
  
        // Attendre la fin de rotateFix avant de lancer crescendoDecrescendo
        box.addEventListener(
          "animationend",
          function rotateFixEnd() {
            box.classList.remove("rotateFix");
            box.removeEventListener("animationend", rotateFixEnd);
  
            console.log("rotateFix terminé, lancement de crescendoDecrescendo...");
            box.classList.add("spinning");
            startCrescendoDecrescendo();
          }
        );
      } else {
        console.log("Lancement direct de crescendoDecrescendo...");
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
    this.isVideoPlaying = true;
    this.isUnblurred = true;

    setTimeout(() => {
      this.isLegendaryVideoPlaying = true;
    }, 2000);


    setTimeout(() => {
      this.stopVideo();
    }, 7000);

    setTimeout(() => {
      this.stopRarityVideo();
    }, 9000);
  }

  stopVideo() {
    this.isVideoPlaying = false;
  }

  stopRarityVideo() {
    this.isLegendaryVideoPlaying = false;
  }

}
