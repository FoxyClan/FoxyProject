import { Component, ElementRef, HostListener, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { TraitOptionsService } from '../../services/trait-options.service';
import { CacheService } from '../../services/cache.service';
import axios from "axios";
import { ModalCollection } from "../modal-collection/modal-collection.component";
import { ActivatedRoute } from '@angular/router';
import { RotateWarningComponent } from "../rotate-warning/rotate-warning.component";



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
  imports: [CommonModule, FormsModule, ModalCollection, RotateWarningComponent],
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


export class CollectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('containerBlock2', { static: true }) containerBlock2!: ElementRef;
  @ViewChild('container', { static: true }) container!: ElementRef;
  
  addresses: string[] = [];
  adr: string = "";
  msg: string = "";
  private controller: AbortController | null = null;
  cacheVersion: string = '';

  traits: string[] = ['HEAD COVERING', 'EYES', 'MOUTH', 'CLOTHES', 'FUR', 'BACKGROUND', 'TRANSCENDENCE'];
  isTraitOpen: boolean[] = [];

  baseUri : string = 'https://foxyclan.s3.filebase.com/';
  tokens: Metadata[] = [];
  noResult: boolean = false;
  tokenIndex: number = 0;
  isLoading: boolean = false;

  selectedToken: Metadata | null = null
  selectedFilters: { value: string, type: string }[] = [];
  showModal: boolean = false;
  
  
  constructor(
    protected traitOptionsService: TraitOptionsService, 
    private route: ActivatedRoute, 
    private cacheService: CacheService,
  ) {}


  ngOnInit() {
    this.cacheService.cacheVersion$.subscribe((version) => {
      this.cacheVersion = version;
    });
    this.isTraitOpen = new Array(this.traits.length).fill(false);
  
    this.resetFilters();
  
    this.route.queryParams.subscribe(params => {
      const trait = params['trait'];
      const value = params['value'];
  
      if (trait && value) {
        this.resetFilters();
        this.clearAllFilters();
        this.applyQueryFilter(trait, value);
        this.updateSelectedFilters(value, trait)
      } else {
        this.filteredTokens();
      }
    });
    
  }

  ngOnDestroy(): void {
    if (this.controller) this.controller.abort();
    this.tokens = [];
  }


  ngAfterViewInit() {
    this.addScrollListener();
  }

  addScrollListener() {
    const isMobile = window.innerWidth <= 600;
    const scrollElement = isMobile
      ? this.container?.nativeElement
      : this.containerBlock2?.nativeElement;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', () => this.onScroll(scrollElement));
    }
  }
  

  
  onScroll(scrollElement?: HTMLElement): void {
    if (!scrollElement) return;
  
    const bottomReached =
      scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 30;
  
    if (bottomReached && !this.isLoading && this.tokenIndex != -1) {
      this.filteredTokens(this.tokenIndex);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.addScrollListener(); // si l'utilisateur change la taille de la fenêtre
  }


  updateSelectedFilters(value: string, type: string) {
    const category = this.getFilterCategory(type);
    if (category) {
      const option = category.find(opt => opt.name === value);
      if (option) {
        
        if (option.selected) {
          this.selectedFilters.push({ value, type });
        } else {
          this.selectedFilters = this.selectedFilters.filter(f => !(f.value === value && f.type === type));
        }
      }
    }
    this.filteredTokens();
  }

  removeFilter(filter: { value: string, type: string }) {
    const category = this.getFilterCategory(filter.type);
    if (category) {
      const option = category.find(opt => opt.name === filter.value);
      if (option) {
        option.selected = false;
      }
    }
    this.selectedFilters = this.selectedFilters.filter(f => !(f.value === filter.value && f.type === filter.type));
    this.filteredTokens();
  }

  clearAllFilters() {
    this.selectedFilters = [];
    this.resetFilters();
    this.filteredTokens();

    if (typeof window !== 'undefined') {
      const newUrl = window.location.origin + '/collection';
      window.history.pushState({}, '', newUrl);
    }
  }
  

  resetFilters() {
    this.traitOptionsService.mouthOptions.forEach(option => option.selected = false);
    this.traitOptionsService.headCoveringOptions.forEach(option => option.selected = false);
    this.traitOptionsService.eyesOptions.forEach(option => option.selected = false);
    this.traitOptionsService.clothesOptions.forEach(option => option.selected = false);
    this.traitOptionsService.furOptions.forEach(option => option.selected = false);
    this.traitOptionsService.backgroundOptions.forEach(option => option.selected = false);
    this.traitOptionsService.transcendenceOptions.forEach(option => option.selected = false);
  }

  applyQueryFilter(trait: string, value: string) {
    const filterCategory = this.getFilterCategory(trait);
    if (filterCategory) {
      const option = filterCategory.find(opt => opt.name === value);
      if (option) {
        option.selected = true;
      }
    }
  }

  getFilterCategory(trait: string) {
    switch (trait.toUpperCase()) {
      case 'MOUTH': return this.traitOptionsService.mouthOptions;
      case 'HEAD COVERING': return this.traitOptionsService.headCoveringOptions;
      case 'EYES': return this.traitOptionsService.eyesOptions;
      case 'CLOTHES': return this.traitOptionsService.clothesOptions;
      case 'FUR': return this.traitOptionsService.furOptions;
      case 'BACKGROUND': return this.traitOptionsService.backgroundOptions;
      case 'TRANSCENDENCE': return this.traitOptionsService.transcendenceOptions;
      default: return null;
    }
  }


  toggleTrait(index: number) {
    this.isTraitOpen = this.isTraitOpen.map((_, i) => i === index ? !this.isTraitOpen[i] : false);
  }


  async filteredTokens(tokenIndex: number = 0) {
    this.isLoading = true;
    if (this.controller) this.controller.abort();
    this.controller = new AbortController();
    const signal = this.controller.signal;
    
    if(tokenIndex === 0) this.tokens = [];
    
    let tokenCount = 0;
    this.noResult = false;

    const selectedMouth = this.traitOptionsService.mouthOptions.filter(option => option.selected).map(option => option.name);
    const selectedHeadCovering = this.traitOptionsService.headCoveringOptions.filter(option => option.selected).map(option => option.name);
    const selectedEyes = this.traitOptionsService.eyesOptions.filter(option => option.selected).map(option => option.name);
    const selectedClothes = this.traitOptionsService.clothesOptions.filter(option => option.selected).map(option => option.name);
    const selectedFur = this.traitOptionsService.furOptions.filter(option => option.selected).map(option => option.name);
    const selectedBackground = this.traitOptionsService.backgroundOptions.filter(option => option.selected).map(option => option.name);
    const selectedTranscendence = this.traitOptionsService.transcendenceOptions.filter(option => option.selected).map(option => option.name);
  
    const filters = [
      { type: 'Mouth', selected: selectedMouth },
      { type: 'HEAD COVERING', selected: selectedHeadCovering },
      { type: 'EYES', selected: selectedEyes },
      { type: 'CLOTHES', selected: selectedClothes },
      { type: 'FUR', selected: selectedFur },
      { type: 'BACKGROUND', selected: selectedBackground },
      { type: 'TRANSCENDENCE', selected: selectedTranscendence }
    ];

    try {
      const bucketResponse = await axios.get(this.baseUri + `?t=${this.cacheVersion}`, { 
        responseType: 'text',
        withCredentials: false // Empêche l'envoi de cookies tiers 
      });
      if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(bucketResponse.data, 'application/xml');
      const keys = Array.from(xmlDoc.getElementsByTagName('Key')).map(node => node.textContent || '');

      const jsonFiles = keys.filter(key => key.endsWith('.json'));
      jsonFiles.sort((a, b) => {
        const numA = parseInt(a.replace(".json", ""), 10);
        const numB = parseInt(b.replace(".json", ""), 10);
        return numA - numB;
      });

      let i = tokenIndex;
      for (i; i < jsonFiles.length; i++) {
        if (tokenCount >= 20) break;
        const tokenId = jsonFiles[i].replace('.json', '');
        const imageKey = `${tokenId}.png`;

        if (!keys.includes(imageKey)) continue;

        try {
          const response = await axios.get<Metadata>(`${this.baseUri}${jsonFiles[i]}` + `?t=${this.cacheVersion}`, { 
            signal, 
            withCredentials: false  
          });
          const metadata = response.data;
          metadata.tokenId = parseInt(tokenId);

          const matchesAllFilters = filters.every(filter =>
            (filter.selected.length === 0 ||
            metadata.attributes.some(attr =>
              attr.trait_type.trim().toLowerCase() === filter.type.trim().toLowerCase() &&
              filter.selected.includes(attr.value)
            )) && metadata.image != this.baseUri + "undiscovered.png"
          );
          if (matchesAllFilters) {
            this.tokens.push(metadata);
            tokenCount++;
          }
        } catch (error) {
          console.warn(`Erreur lors de la récupération du JSON : ${jsonFiles[i]}`, error);
        }
      }
      this.tokenIndex = i >= jsonFiles.length ? -1 : i;
      if (this.tokens.length === 0 && !signal.aborted) this.noResult = true;
    } catch (error) {
      console.error("Erreur lors de la récupération des fichiers du bucket:", error);
      this.noResult = true;
    } finally {
      this.isLoading = false;
    }
  }

  openModal(token: Metadata) {
    this.selectedToken = token;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedToken = null;
  }
  
  
  
  /* RESPONSIVE */

  isFilterModalOpen = false;
  filterModalAnimation = '';
  startY: number = 0;
  currentY: number = 0;
  isDragging: boolean = false;
  threshold: number = 100; // distance à parcourir pour déclencher la fermeture


  openFilterModal() {
    this.isFilterModalOpen = true;
    document.body.classList.add('modal-open');
  
    setTimeout(() => {
      this.filterModalAnimation = 'slide-in';
    }, 10);
  }
  
  closeFilterModal() {
    this.filterModalAnimation = 'slide-out';
    setTimeout(() => {
      this.isFilterModalOpen = false;
      document.body.classList.remove('modal-open');
    }, 300);
  }
  

  onTouchStart(event: TouchEvent) {
    this.startY = event.touches[0].clientY;
    this.currentY = this.startY;
    this.isDragging = true;
  }
  
  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
  
    this.currentY = event.touches[0].clientY;
    const deltaY = this.currentY - this.startY;
  
    const modal = document.querySelector('.filter-modal-overlay') as HTMLElement;
    if (modal && deltaY > 0) {
      modal.style.transform = `translateY(${deltaY}px)`;
      modal.style.transition = 'none';
    }
  }
  
  onTouchEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
  
    const deltaY = this.currentY - this.startY;
    const modal = document.querySelector('.filter-modal-overlay') as HTMLElement;
  
    if (deltaY > this.threshold) {
      this.closeFilterModal();
    } else {
      // Remet la modal en place
      if (modal) {
        modal.style.transition = 'transform 0.3s ease-in-out';
        modal.style.transform = 'translateY(0)';
      }
    }
  }
  

}