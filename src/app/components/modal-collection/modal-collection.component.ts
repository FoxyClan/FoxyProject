import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Web3Service } from "../../services/web3.service";
import { Router, RouterLink } from '@angular/router';
import { CacheService } from '../../services/cache.service';
import { TraitOptionsService } from '../../services/trait-options.service';

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
  imports: [CommonModule, RouterLink],
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
  showTooltip: boolean = false;
  rarity: any = "Loading...";
  
  cacheVersion: string = '';

  constructor(private web3Service: Web3Service, 
    private router: Router,
    private cacheService: CacheService,
    private traitOptionsService: TraitOptionsService
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
        this.getRarity(this.token.attributes),
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
      this.tokenLevel = "xxx";
    }
  }

  async getTokenPoints(tokenId: number) {
    try {
      const result = await this.web3Service.getTokenPoints(tokenId);
      this.foxyPoints = Number(result);
    } catch (error) {
      console.error("Token Points fetch failed:", error);
      this.foxyPoints = "xxx";
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


  getRarity(attributes: Array<{ value: string; trait_type: string }>) {
    let total = 0;
    for(let item of attributes) {
      let index = this.traitOptionsService.getTraitIndex(item.value, item.trait_type);
      if (index === null) {
        console.error("Trait not found");
        index = 15;
      }
      if (item.trait_type === "Transcendence") {
        if(index == 1) index = -3;
        else if(index == 0) index = -5;
      }
      total += index;
    }
    if(total < 0) total = 0;
    total = (total / 87 * 100);
    this.rarity = parseFloat(total.toFixed(1));
  }
  

  getTraitRarity(trait: string, type: string): any {
    return this.traitOptionsService.getTraitRarity(trait, type);
  }

  getTraitIndex(trait: string, type: string) {
    return this.traitOptionsService.getTraitIndex(trait, type);
  }


  formatDNA(dna: string | undefined): string {
    if(dna == null || dna == undefined) return "Fail to fetch";
    return dna.replace(/(.{2})/g, "$1 ");
}


}
