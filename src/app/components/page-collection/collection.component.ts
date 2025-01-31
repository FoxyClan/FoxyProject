import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { TraitOptionsService } from '../../services/trait-options.service';
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
  noResult: boolean = false;
  
  
  constructor(private http: HttpClient, protected traitOptionsService: TraitOptionsService) {
    if ('caches' in window) {                             // a tester /////////////////////////////////////
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
    let tokenCount = 0;
    this.noResult = false;

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

    try {
      // 🔹 Récupérer la liste des fichiers du bucket
      const bucketResponse = await axios.get(this.baseUri, { responseType: 'text' });
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(bucketResponse.data, 'application/xml');
      const keys = Array.from(xmlDoc.getElementsByTagName('Key')).map(node => node.textContent || '');

      // 🔹 Filtrer les fichiers JSON existants
      const jsonFiles = keys.filter(key => key.endsWith('.json'));
      jsonFiles.sort((a, b) => {
        const numA = parseInt(a.replace(".json", ""), 10);
        const numB = parseInt(b.replace(".json", ""), 10);
        return numA - numB;
      });

      for (let jsonFile of jsonFiles) {
        if (tokenCount >= 20) break; // Limite de 20 tokens affichés

        const tokenId = jsonFile.replace('.json', '');
        const imageKey = `${tokenId}.png`;

        // 🔹 Vérifier si l'image PNG correspondante existe
        if (!keys.includes(imageKey)) continue;

        try {
          const response = await axios.get<Metadata>(`${this.baseUri}${jsonFile}`, { signal });
          const metadata = response.data;
          metadata.tokenId = parseInt(tokenId);

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
        } catch (error) {
          console.warn(`Erreur lors de la récupération du JSON : ${jsonFile}`, error);
        }
      }
      console.log(this.tokens.length === 0)
      if (this.tokens.length === 0 && !signal.aborted) this.noResult = true;
    } catch (error) {
      console.error("Erreur lors de la récupération des fichiers du bucket:", error);
      this.noResult = true;
    } finally {
      //this.isLoading = false;
    }
  }
  
  
  


}