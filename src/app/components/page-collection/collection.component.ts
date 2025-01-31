import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { TraitOptionsService } from '../../services/trait-options.service';
import { Web3Service } from "../../services/web3.service";
import axios from "axios";


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
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
  animations: [
    trigger('slideIn', [
      state('in', style({
        height: '*',
        opacity: 1,
        marginLeft: '0px',
      })),
      state('out', style({
        height: '0px',
        opacity: 0,
        marginLeft: '-15px',
      })),
      transition('in => out', [
        animate('300ms ease')
      ]),
      transition('out => in', [
        animate('300ms ease')
      ])
    ]),
    trigger('popIn', [
      state('void', style({
        transform: 'scale(0.8)',
        opacity: 0
      })),
      transition('void => *', [
        animate('200ms ease-out',
          style({transform: 'scale(1)', opacity: 1}))
      ])
    ])
  ]
})


export class CollectionComponent implements OnInit {
  addresses: string[] = [];
  adr: string = "";
  msg: string = "";
  private controller: AbortController | null = null;

  traits: string[] = ['HEAD COVERING', 'EYES', 'MOUTH', 'CLOTHES', 'FUR', 'BACKGROUND'];
  isTraitOpen: boolean[] = [];

  baseUri : string = 'https://foxyclan.s3.filebase.com/';
  tokens: Metadata[] = [];
  tokenIndex: number = 0;
  noResult: boolean = false;
  
  
  constructor(private http: HttpClient, protected traitOptionsService: TraitOptionsService, private web3Service: Web3Service) {
    if ('caches' in window) {
      console.log("hey")
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }
  }

  ngOnInit() {
    this.isTraitOpen = new Array(this.traits.length).fill(false);
    this.filteredTokens();
  }

  toggleTrait(index: number) {
    this.isTraitOpen = this.isTraitOpen.map((_, i) => i === index ? !this.isTraitOpen[i] : false);
  }


  async filteredTokens() {
    if (this.controller) this.controller.abort();
    this.controller = new AbortController();
    const signal = this.controller.signal;
    
    this.tokens = [];
    this.tokenIndex = 0;
    let tokenCount = 0;
    this.noResult = false;
    let consecutiveMisses = 0;

    const selectedMouth = this.traitOptionsService.mouthOptions.filter(option => option.selected).map(option => option.name);
    const selectedHeadCovering = this.traitOptionsService.headCoveringOptions.filter(option => option.selected).map(option => option.name);
    const selectedEyes = this.traitOptionsService.eyesOptions.filter(option => option.selected).map(option => option.name);
    const selectedClothes = this.traitOptionsService.clothesOptions.filter(option => option.selected).map(option => option.name);
    const selectedFur = this.traitOptionsService.furOptions.filter(option => option.selected).map(option => option.name);
    const selectedBackground = this.traitOptionsService.backgroundOptions.filter(option => option.selected).map(option => option.name);
  
    const filters = [
      { type: 'Mouth', selected: selectedMouth },
      { type: 'HEAD COVERING', selected: selectedHeadCovering },
      { type: 'EYES', selected: selectedEyes },
      { type: 'CLOTHES', selected: selectedClothes },
      { type: 'FUR', selected: selectedFur },
      { type: 'BACKGROUND', selected: selectedBackground }
    ];
  
    while (tokenCount < 20) {
      try {
        await axios.head(this.baseUri + this.tokenIndex + ".png", { signal });
        const response = await axios.get<Metadata>(this.baseUri + this.tokenIndex + ".json", { signal });
        const metadata = response.data;
        metadata.tokenId = this.tokenIndex;
  
        const matchesAllFilters = filters.every(filter =>
          filter.selected.length === 0 ||
          metadata.attributes.some(attr =>
            attr.trait_type.trim().toLowerCase() === filter.type.trim().toLowerCase() &&
            filter.selected.includes(attr.value)
          )
        );
        if (matchesAllFilters) {
          this.tokens.push(metadata);
          tokenCount++;
        }
        consecutiveMisses = 0;
      } catch (error) {
        consecutiveMisses++;
        if (consecutiveMisses >= 10) {
          if (this.tokens.length === 0 && signal.aborted === false) {
            this.noResult = true;
          }
          this.tokenIndex = 0;
          return;
        }
      }
      this.tokenIndex++;
    }
  }
  
  
  


}