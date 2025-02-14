import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Web3Service } from "../../services/web3.service";
import { Router } from '@angular/router';
import { CacheService } from '../../services/cache.service';

interface Metadata {
  tokenId: number;
  image: string;
  DNA: string;
  name: string;
  description: string;
  attributes: Array<{ value: string; trait_type: string }>;
}

@Component({
  selector: 'app-modal-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-collection.component.html',
  styleUrl: './modal-collection.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0, transform: 'scale(0.9)' })),
      transition(':enter', [
        animate('300ms ease-in-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class ModalCollection implements OnInit {
  @Input() token!: Metadata | null;
  @Output() closeModalEvent = new EventEmitter<void | boolean>();

  tokenLevel: any = "Loading...";
  foxyPoints: any = "Loading...";
  ownerOfToken: string = "Loading...";
  backgroundColor: string = '';
  isLoading: boolean = true;
  
  cacheVersion: string = '';

  constructor(private web3Service: Web3Service, 
    private router: Router,
    private cacheService: CacheService
  ) {}

  async ngOnInit() {
    this.cacheService.cacheVersion$.subscribe((version) => {
      this.cacheVersion = version;
    });
    if (this.token) {
      await Promise.all([
        this.setBackground(),
        this.level(this.token.tokenId),
        this.getTokenPoints(this.token.tokenId),
        this.ownerOf(this.token.tokenId)
      ]);
      this.isLoading = false;
    }
  }
  

  closeModal(closeAll?: boolean) {
    this.closeModalEvent.emit(closeAll);
  }


  async level(levelTokenId: number) {
    try {
      const result = await this.web3Service.level(levelTokenId);
      this.tokenLevel = Number(result);
    } catch (error) {
      console.error("Level fetch failed:", error);
      this.tokenLevel = "Fail to fetch";
    }
  }

  async getTokenPoints(tokenId: number) {
    try {
      const result = await this.web3Service.getTokenPoints(tokenId);
      this.foxyPoints = Number(result);
    } catch (error) {
      console.error("Token Points fetch failed:", error);
      this.foxyPoints = "Fail to fetch";
    }
  }

  async ownerOf(tokenId: number) {
    try {
      const result = await this.web3Service.ownerOf(tokenId);
      this.ownerOfToken = String(result);
    } catch (error) {
      console.error("Owner fetch failed:", error);
      this.ownerOfToken = "Fail to fetch";
    }
  }

  async setBackground() {
    if (this.token) {
      const backgroundAttr = this.token.attributes.find(attr => attr.trait_type.toLowerCase() === 'background');
      this.backgroundColor = backgroundAttr ? "Background/" + backgroundAttr.value + ".png" : 'linear-gradient(to bottom,rgba(1, 2, 4, 0.9),rgba(50, 166, 186, 0.9))';
    }
  }

  filterByAttribute(attribute: { trait_type: string, value: string }) {
    this.closeModal(true);
    this.router.navigate(['/collection'], { 
      queryParams: { trait: attribute.trait_type, value: attribute.value }, 
      queryParamsHandling: 'merge'
    });
  }
}
