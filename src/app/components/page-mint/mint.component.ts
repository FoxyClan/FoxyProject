import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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

  private subscription: Subscription;
  private isConnected: boolean = false;
  private isInitialized = false;
  private interval: any;
  isPublicSaleActive: boolean = false;
  walletAddress: any;
  showMint: boolean = false;
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
      }
    });
    this.publicSaleIsActive();
  }

  
  async startHandleRotation() {
    const box = this.box.nativeElement as HTMLElement;
    box.classList.add("rotation");
    if (isPlatformBrowser(this.platformId)) {
      this.interval = setInterval(() => {
        this.handleRotation();
      }, 2000);
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
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  showMintModal() {
    this.showMint = true;
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

  async merge() {
    try {
      const result = await this.web3Service.merge(0, 1);
      console.log("Merge successful:", result);
    } catch (error) {
      console.error("Merge error:", error);
    }
  }

  async flipSale() {
    try {
      const result = await this.web3Service.flipPublicSaleState(100, true);
      this.publicSaleIsActive();
      console.log("Fliping successful:", result);
    } catch (error) {
      console.error("Fliping error:", error);
    }
  }

  async balanceOf() {
    if (!this.walletAddress) {
       console.error("Wallet address not available");
       return;
    }
    try {
       const result = await this.web3Service.balanceOf(this.walletAddress);
       console.log("Balance:", Number(result));
    } catch (error) {
       console.error("Balance error:", error);
    }
  }

  async publicSaleIsActive() {
    try {
       const result = await this.web3Service.publicSaleIsActive();
       this.isPublicSaleActive = Boolean(result);
       console.log("publicSaleIsActive:", Boolean(result));
    } catch (error) {
       console.error("publicSaleIsActive fail to fetch:", error);
    }
  }

 
 

    
}
