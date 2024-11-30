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
  
    if (box) {
      // Écoute l'événement "animationiteration" pour détecter la fin d'un cycle d'animation
      const handleAnimationEnd = () => {
        // Supprime l'écouteur pour éviter plusieurs déclenchements
        box.removeEventListener("animationiteration", handleAnimationEnd);
  
        // Passe à la deuxième animation
        box.classList.add("spinning");
        this.playVideo();
  
        // Supprime la deuxième animation après qu'elle se termine
        setTimeout(() => {
          box.classList.remove("spinning");
          box.style.animation = "none"; // Fixe la boîte à sa position finale
          box.style.transform = "rotateY(1080deg)"; // Position finale après 3 tours
        }, 7000); // Durée de `crescendoDecrescendo`
      };
  
      // Attendre que le cycle actuel de "defaultRotation" se termine
      box.addEventListener("animationiteration", handleAnimationEnd);
    }
  }
  
  

  playVideo() {
    this.isVideoPlaying = true;
    this.isUnblurred = true;

    setTimeout(() => {
      this.stopVideo();
    }, 7000);
  }

  stopVideo() {
    this.isVideoPlaying = false;
  }

}
