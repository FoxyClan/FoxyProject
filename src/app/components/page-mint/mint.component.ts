import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { NotConnectedModal } from '../modal-not-connected/not-connected.component';
import { combineLatest, Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';  
import { CommonModule } from '@angular/common';
import { Web3Service } from "../../services/web3.service";
import { ModalMint } from "../modal-mint/modal-mint.component";
import { ChangeDetectorRef } from '@angular/core';
import Web3 from 'web3';

@Component({
  selector: 'app-mint',
  standalone: true,
  imports: [
    NotConnectedModal,
    CommonModule,
    ModalMint
  ],
  templateUrl: './mint.component.html',
  styleUrl: './mint.component.css'
})

export class MintComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('box') box!: ElementRef;
  mintModalData: boolean = false;

  private subscription: Subscription;
  private isConnected: boolean = false;
  private isInitialized = false;
  isPublicSaleActive: boolean = false;
  isAllowListActive: boolean = false;
  walletAddress: any;
  showMint: boolean = false;
  errorMessage: string = "";
  private timeoutId: any; //for the errorMessage
  images = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png']; // obligatoirement un nombre pair d'image
  currentIndex: number = 0;
  currentFront: number = 0;
  currentBack: number = 1;

  currentImages = {
    front: this.images[this.currentFront],
    back: this.images[this.currentBack],
  };

  constructor(
    private web3Service: Web3Service,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {this.subscription = new Subscription()}
  

  ngAfterViewChecked() {
    if (!this.isInitialized && this.box && this.box.nativeElement) {
      const box = this.box.nativeElement as HTMLElement;
      if (box) {
        this.startHandleRotation();
        this.isInitialized = true;
      }
    }
  }
  
  ngOnInit() {
    this.subscription = combineLatest([
      this.web3Service.isConnected$,
      this.web3Service.walletAddress$
    ]).subscribe(([isConnected, walletAddress]) => {
      this.isConnected = isConnected;
      if (walletAddress) {
        const checksumAddress = Web3.utils.toChecksumAddress(walletAddress);
        this.walletAddress = checksumAddress;
        this.publicSaleIsActive();
        this.allowListisActive();
      }
    });
  }

  cantMint() {
    this.displayError("Public sale must be activated to mint an NFT");
  }
  
  cantAllowList() {
    this.displayError("Public sale must be activated to mint an NFT");
  }
  
  private displayError(message: string) {
    this.errorMessage = message;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.errorMessage = "";
      this.timeoutId = null;
    }, 3000);
  }
  
  async startHandleRotation() {
    const box = this.box.nativeElement as HTMLElement;
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => this.checkRotationAndStart());
    }
  }

  checkRotationAndStart() {
    const box = this.box.nativeElement as HTMLElement;
    const currentRotation = this.getCurrentRotation(box);
   
    if ((currentRotation > 88  &&  currentRotation < 92) 
      || (currentRotation < -88  &&  currentRotation > -92)) {
      this.handleRotation();
    }
    // Keep checking rotation in the next animation frame
    requestAnimationFrame(() => this.checkRotationAndStart());
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


  async handleRotation() {
    try {
      if (this.currentIndex % 2 === 0) {
        this.currentFront = (this.currentFront + 2) % this.images.length;
      } else {
        this.currentBack = (this.currentBack + 2) % this.images.length;
      }
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
  
      if (this.currentFront < this.images.length && this.currentBack < this.images.length) {
        this.currentImages.front = this.images[this.currentFront];
        this.currentImages.back = this.images[this.currentBack];
      } else {
        console.error("Invalid indices detected:", this.currentFront, this.currentBack);
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.error("Error during rotation:", error);
    }
  }
  

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  showMintModal(isAllowList: boolean) {
    this.mintModalData = isAllowList; // Définit la valeur de mintModalData
    this.showMint = true; // Affiche la modal
  }

  closeMintModal() {
    this.showMint = false;
  }

  getConnected() {
    return this.isConnected;
  }

  async setBaseUri() {
    try {
      const result = await this.web3Service.setBaseURI("https://foxyclan.s3.filebase.com/");
      console.log("setBaseUri successful:", result);
    } catch (error) {
      console.error("setBaseUri error:", error);
    }
  }

  async publicSaleIsActive() {
    try {
       const result = await this.web3Service.publicSaleIsActive();
       this.isPublicSaleActive = Boolean(result);
    } catch (error) {
       console.error("publicSaleIsActive fail to fetch:", error);
    }
  }

  async allowListisActive() {
    try {
       const result = await this.web3Service.allowListisActive();
       this.isAllowListActive = Boolean(result);
    } catch (error) {
       console.error("privateSaleIsActive fail to fetch:", error);
    }
  }

 
 

    
}
